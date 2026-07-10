import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

export const contractsNeedingAllocation = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
  },
  handler: async (ctx, args) => {
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_koperasi_and_status", (q) =>
        q.eq("koperasiId", args.koperasiId).eq("status", "active"),
      )
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

    return rows
      .filter((row) => row.remainingKg > 0)
      .sort((a, b) => a.deadlineAt - b.deadlineAt);
  },
});

export const availableDepositsForContract = query({
  args: {
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      return null;
    }

    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_koperasi_and_commodity", (q) =>
        q
          .eq("koperasiId", contract.koperasiId)
          .eq("commodityId", contract.commodityId),
      )
      .collect();

    const availableDeposits = deposits.filter(
      (deposit) =>
        deposit.status === "quality_checked" &&
        (deposit.qualityScore ?? 0) >= contract.minimumQualityScore,
    );

    return Promise.all(
      availableDeposits
        .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))
        .map(async (deposit) => {
          const member = await ctx.db.get(deposit.memberId);

          return {
            depositId: deposit._id,
            depositNumber: deposit.depositNumber,
            memberName: member?.name ?? "Anggota tidak ditemukan",
            availableWeightKg: deposit.weightKg,
            qualityScore: deposit.qualityScore ?? null,
            submittedAt: deposit.submittedAt,
          };
        }),
    );
  },
});

export const allocateDepositToContract = mutation({
  args: {
    contractId: v.id("contracts"),
    depositId: v.id("deposits"),
    allocatedWeightKg: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [contract, deposit] = await Promise.all([
      ctx.db.get(args.contractId),
      ctx.db.get(args.depositId),
    ]);

    if (!contract) {
      throw new Error("Kontrak tidak ditemukan.");
    }

    if (!deposit) {
      throw new Error("Setoran tidak ditemukan.");
    }

    if (deposit.koperasiId !== contract.koperasiId) {
      throw new Error("Setoran dan kontrak berada di koperasi berbeda.");
    }

    if (deposit.commodityId !== contract.commodityId) {
      throw new Error("Komoditas setoran tidak cocok dengan kontrak.");
    }

    if (deposit.status !== "quality_checked") {
      throw new Error("Setoran harus lolos QC sebelum dialokasikan.");
    }

    if ((deposit.qualityScore ?? 0) < contract.minimumQualityScore) {
      throw new Error("Quality score setoran tidak memenuhi minimum kontrak.");
    }

    if (args.allocatedWeightKg <= 0 || args.allocatedWeightKg > deposit.weightKg) {
      throw new Error("Berat alokasi tidak valid.");
    }

    const allocationId = await ctx.db.insert("supplyPools", {
      koperasiId: contract.koperasiId,
      contractId: args.contractId,
      depositId: args.depositId,
      allocatedWeightKg: args.allocatedWeightKg,
      qualityScoreSnapshot: deposit.qualityScore ?? 0,
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
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
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
              (total, allocation) => total + allocation.qualityScoreSnapshot,
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
