import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

type QualityGrade = "A" | "B" | "C" | "D";

function gradeRank(grade: QualityGrade) {
  return grade === "A" ? 0 : grade === "B" ? 1 : grade === "C" ? 2 : 3;
}

function legacyGrade(score: number | undefined): QualityGrade {
  if (typeof score !== "number") return "D";
  if (score >= 90) return "A";
  if (score >= 82) return "B";
  if (score >= 70) return "C";
  return "D";
}

export const contractsNeedingAllocation = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const koperasi = await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first();
    if (!koperasi) throw new Error("Profil koperasi belum tersedia.");
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const rows = await Promise.all(
      contracts.map(async (contract) => {
        const [commodity, allocations] = await Promise.all([
          ctx.db.get(contract.commodityId),
          ctx.db
            .query("supplyPools")
            .withIndex("by_contract", (q) => q.eq("contractId", contract._id))
            .collect(),
        ]);
        const allocatedWeightKg = allocations
          .filter((allocation) => allocation.status === "allocated")
          .reduce((total, allocation) => total + allocation.allocatedWeightKg, 0);

        return {
          contractId: contract._id,
          contractNumber: contract.contractNumber,
          commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
          targetVolumeKg: contract.targetVolumeKg,
          allocatedWeightKg,
          remainingKg: Math.max(contract.targetVolumeKg - allocatedWeightKg, 0),
          minimumQualityScore: contract.minimumQualityScore,
          deadlineAt: contract.deadlineAt,
        };
      }),
    );

    return rows.sort((a, b) => a.deadlineAt - b.deadlineAt);
  },
});

export const availableDepositsForContract = query({
  args: {
    token: v.string(),
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const koperasi = await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first();
    if (!koperasi) throw new Error("Profil koperasi belum tersedia.");
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      return null;
    }
    if (contract.status !== "active") throw new Error("Kontrak tidak aktif.");

    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_koperasi_and_commodity", (q) =>
        q
          .eq("koperasiId", koperasi._id)
          .eq("commodityId", contract.commodityId),
      )
      .collect();

    const minimumGrade = contract.minimumQualityGrade ?? legacyGrade(contract.minimumQualityScore);
    const availableDeposits = deposits.filter((deposit) => {
      const passedQc = deposit.status === "quality_checked" ||
        (deposit.status === "recorded" && (deposit.qualityDecision === "passed" || deposit.qualityDecision === "priority"));
      const depositGrade = deposit.qualityGrade ?? legacyGrade(deposit.qualityScore);
      return passedQc && gradeRank(depositGrade) <= gradeRank(minimumGrade);
    });

    return Promise.all(
      availableDeposits
        .sort((a, b) => gradeRank(a.qualityGrade ?? legacyGrade(a.qualityScore)) - gradeRank(b.qualityGrade ?? legacyGrade(b.qualityScore)))
        .map(async (deposit) => {
          const member = await ctx.db.get(deposit.memberId);

          return {
            depositId: deposit._id,
            depositNumber: deposit.depositNumber,
            memberName: member?.name ?? "Anggota tidak ditemukan",
            availableWeightKg: deposit.weightKg,
            qualityScore: deposit.qualityScore ?? null,
            qualityGrade: deposit.qualityGrade ?? legacyGrade(deposit.qualityScore),
            submittedAt: deposit.submittedAt,
          };
        }),
    );
  },
});

export const allocateDepositToContract = mutation({
  args: {
    token: v.string(),
    contractId: v.id("contracts"),
    depositId: v.id("deposits"),
    allocatedWeightKg: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const koperasi = await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first();
    if (!koperasi) throw new Error("Profil koperasi belum tersedia.");
    const [contract, deposit] = await Promise.all([
      ctx.db.get(args.contractId),
      ctx.db.get(args.depositId),
    ]);

    if (!contract) {
      throw new Error("Kontrak tidak ditemukan.");
    }
    if (contract.status !== "active") throw new Error("Kontrak tidak aktif.");

    if (!deposit) {
      throw new Error("Setoran tidak ditemukan.");
    }

    if (deposit.koperasiId !== koperasi._id) {
      throw new Error("Setoran bukan milik koperasi yang sedang login.");
    }

    if (deposit.commodityId !== contract.commodityId) {
      throw new Error("Komoditas setoran tidak cocok dengan kontrak.");
    }

    const passedQc = deposit.status === "quality_checked" ||
      (deposit.status === "recorded" && (deposit.qualityDecision === "passed" || deposit.qualityDecision === "priority"));
    if (!passedQc) {
      throw new Error("Setoran harus lolos QC sebelum dialokasikan.");
    }

    const minimumGrade = contract.minimumQualityGrade ?? legacyGrade(contract.minimumQualityScore);
    const depositGrade = deposit.qualityGrade ?? legacyGrade(deposit.qualityScore);
    if (gradeRank(depositGrade) > gradeRank(minimumGrade)) {
      throw new Error("Grade setoran tidak memenuhi minimum grade kontrak.");
    }

    if (args.allocatedWeightKg <= 0 || args.allocatedWeightKg > deposit.weightKg) {
      throw new Error("Berat alokasi tidak valid.");
    }

    const allocationId = await ctx.db.insert("supplyPools", {
      koperasiId: koperasi._id,
      contractId: args.contractId,
      depositId: args.depositId,
      allocatedWeightKg: args.allocatedWeightKg,
      qualityScoreSnapshot: deposit.qualityScore ?? 0,
      qualityGradeSnapshot: depositGrade,
      status: "allocated",
      notes: args.notes,
      allocatedAt: Date.now(),
    });

    await ctx.db.patch(args.depositId, {
      status: "allocated",
    });

    return allocationId;
  },
});

export const recalculateContractProgress = mutation({
  args: {
    token: v.string(),
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.token, ["cooperative", "buyer", "admin"]);
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      throw new Error("Kontrak tidak ditemukan.");
    }

    const allocations = await ctx.db
      .query("supplyPools")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    const fulfilledVolumeKg = allocations
      .filter((allocation) => allocation.status === "allocated")
      .reduce((total, allocation) => total + allocation.allocatedWeightKg, 0);
    const fulfillmentPercent = Math.min(
      100,
      Math.round((fulfilledVolumeKg / contract.targetVolumeKg) * 100),
    );

    await ctx.db.patch(args.contractId, {
      fulfilledVolumeKg,
      fulfillmentPercent,
      status: fulfillmentPercent >= 100 ? "completed" : contract.status,
      updatedAt: Date.now(),
    });

    return {
      fulfilledVolumeKg,
      fulfillmentPercent,
    };
  },
});

export const allocationSummaryByContract = query({
  args: {
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      return null;
    }

    const allocations = await ctx.db
      .query("supplyPools")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    const activeAllocations = allocations.filter(
      (allocation) => allocation.status === "allocated",
    );
    const allocatedWeightKg = activeAllocations.reduce(
      (total, allocation) => total + allocation.allocatedWeightKg,
      0,
    );
    const averageQualityScore =
      activeAllocations.length > 0
        ? Math.round(
            activeAllocations.reduce(
              (total, allocation) => total + (allocation.qualityScoreSnapshot ?? 0),
              0,
            ) / activeAllocations.length,
          )
        : null;
    const rows = await Promise.all(
      activeAllocations.map(async (allocation) => {
        const deposit = await ctx.db.get(allocation.depositId);
        const member = deposit ? await ctx.db.get(deposit.memberId) : null;

        return {
          allocationId: allocation._id,
          depositId: allocation.depositId,
          depositNumber: deposit?.depositNumber ?? null,
          memberName: member?.name ?? null,
          allocatedWeightKg: allocation.allocatedWeightKg,
          qualityScore: allocation.qualityScoreSnapshot,
          allocatedAt: allocation.allocatedAt,
        };
      }),
    );

    return {
      contractId: contract._id,
      contractNumber: contract.contractNumber,
      targetVolumeKg: contract.targetVolumeKg,
      allocatedWeightKg,
      remainingKg: Math.max(contract.targetVolumeKg - allocatedWeightKg, 0),
      fulfillmentPercent: Math.min(
        100,
        Math.round((allocatedWeightKg / contract.targetVolumeKg) * 100),
      ),
      averageQualityScore,
      allocationCount: activeAllocations.length,
      rows,
    };
  },
});

export const smartAllocationRecommendation = action({
  args: {
    remainingKg: v.number(),
    candidates: v.array(
      v.object({
        depositId: v.string(),
        availableWeightKg: v.number(),
        qualityScore: v.number(),
      }),
    ),
  },
  handler: async (_ctx, args) => {
    const sortedCandidates = [...args.candidates].sort(
      (a, b) => b.qualityScore - a.qualityScore,
    );
    const selected = [];
    let totalWeightKg = 0;

    for (const candidate of sortedCandidates) {
      if (totalWeightKg >= args.remainingKg) {
        break;
      }

      selected.push(candidate);
      totalWeightKg += candidate.availableWeightKg;
    }

    const averageQualityScore =
      selected.length > 0
        ? Math.round(
            selected.reduce((total, candidate) => total + candidate.qualityScore, 0) /
              selected.length,
          )
        : null;

    return {
      selectedDepositIds: selected.map((candidate) => candidate.depositId),
      totalWeightKg,
      averageQualityScore,
      coversNeed: totalWeightKg >= args.remainingKg,
    };
  },
});
