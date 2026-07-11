import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRole } from "./auth";

function legacyQualityGrade(score: number | undefined) {
  if (typeof score !== "number") return "D" as const;
  if (score >= 90) return "A" as const;
  if (score >= 82) return "B" as const;
  if (score >= 70) return "C" as const;
  return "D" as const;
}

function betterGrade(current: "A" | "B" | "C" | "D" | null, next: "A" | "B" | "C" | "D") {
  if (!current) return next;
  return ["A", "B", "C", "D"].indexOf(next) < ["A", "B", "C", "D"].indexOf(current) ? next : current;
}

export const stockSummaries = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
  },
  handler: async (ctx, args) => {
    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_koperasi", (q) => q.eq("koperasiId", args.koperasiId))
      .collect();

    const summaries = new Map<
      string,
      {
        commodityId: string;
        commodityName: string;
        totalKg: number;
        readyKg: number;
        allocatedKg: number;
        pendingQcKg: number;
        qualityTotal: number;
        qualityCount: number;
        qualityGrade: "A" | "B" | "C" | "D" | null;
        depositCount: number;
      }
    >();

    for (const deposit of deposits) {
      if (deposit.status === "rejected") {
        continue;
      }

      const commodity = await ctx.db.get(deposit.commodityId);
      if (!commodity) {
        continue;
      }

      const key = deposit.commodityId;
      const current = summaries.get(key) ?? {
        commodityId: key,
        commodityName: commodity.name,
        totalKg: 0,
        readyKg: 0,
        allocatedKg: 0,
        pendingQcKg: 0,
        qualityTotal: 0,
        qualityCount: 0,
        qualityGrade: null,
        depositCount: 0,
      };

      current.totalKg += deposit.weightKg;
      current.depositCount += 1;

      if (deposit.status === "allocated") {
        current.allocatedKg += deposit.weightKg;
      } else if (deposit.status === "quality_checked") {
        current.readyKg += deposit.weightKg;
      } else {
        current.pendingQcKg += deposit.weightKg;
      }

      if (typeof deposit.qualityScore === "number") {
        current.qualityTotal += deposit.qualityScore;
        current.qualityCount += 1;
      }
      if (deposit.qualityGrade) {
        current.qualityGrade = betterGrade(current.qualityGrade, deposit.qualityGrade);
      } else if (typeof deposit.qualityScore === "number") {
        current.qualityGrade = betterGrade(current.qualityGrade, legacyQualityGrade(deposit.qualityScore));
      }

      summaries.set(key, current);
    }

    return Array.from(summaries.values())
      .map((summary) => ({
        commodityId: summary.commodityId,
        commodityName: summary.commodityName,
        totalKg: summary.totalKg,
        readyKg: summary.readyKg,
        allocatedKg: summary.allocatedKg,
        pendingQcKg: summary.pendingQcKg,
        averageQualityScore:
          summary.qualityCount > 0
            ? Math.round(summary.qualityTotal / summary.qualityCount)
            : null,
        qualityGrade: summary.qualityGrade,
        depositCount: summary.depositCount,
      }))
      .sort((a, b) => b.totalKg - a.totalKg);
  },
});

export const activeContractProgress = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative", "buyer", "admin"]);
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const visibleContracts = actor.role === "buyer"
      ? contracts.filter((contract) => contract.buyerId === actor._id)
      : contracts;

    const progress = [];

    for (const contract of visibleContracts) {
      const [commodity, buyer, allocations] = await Promise.all([
        ctx.db.get(contract.commodityId),
        ctx.db.get(contract.buyerId),
        ctx.db
          .query("supplyPools")
          .withIndex("by_contract", (q) => q.eq("contractId", contract._id))
          .collect(),
      ]);

      const fulfilledKg = allocations.reduce(
        (total, allocation) => total + allocation.allocatedWeightKg,
        0,
      );
      const percent = Math.min(
        100,
        Math.round((fulfilledKg / contract.targetVolumeKg) * 100),
      );

      progress.push({
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        buyerName: buyer?.name ?? "Buyer tidak ditemukan",
        commodityName: commodity?.name ?? contract.commodityKey ?? "Komoditas tidak ditemukan",
        targetVolumeKg: contract.targetVolumeKg,
        fulfilledKg,
        remainingKg: Math.max(contract.targetVolumeKg - fulfilledKg, 0),
        percent,
        minimumQualityScore: contract.minimumQualityScore,
        minimumQualityGrade: contract.minimumQualityGrade ?? legacyQualityGrade(contract.minimumQualityScore),
        pricePerKg: contract.pricePerKg,
        deadlineAt: contract.deadlineAt,
        allocationCount: allocations.length,
      });
    }

    return progress.sort((a, b) => a.deadlineAt - b.deadlineAt);
  },
});

export const supplyPoolStatuses = query({
  args: {
    token: v.string(),
    koperasiId: v.optional(v.id("koperasiProfiles")),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative", "admin"]);
    const koperasi = actor.role === "cooperative"
      ? await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first()
      : args.koperasiId
        ? await ctx.db.get(args.koperasiId)
        : await ctx.db.query("koperasiProfiles").first();
    if (!koperasi) throw new Error("Profil koperasi belum tersedia.");
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const statuses = [];

    for (const contract of contracts) {
      const [commodity, allocations, readyDeposits] = await Promise.all([
        ctx.db.get(contract.commodityId),
        ctx.db
          .query("supplyPools")
          .withIndex("by_contract", (q) => q.eq("contractId", contract._id))
          .collect(),
        ctx.db.query("deposits").withIndex("by_koperasi_and_commodity", (q) => q.eq("koperasiId", koperasi._id).eq("commodityId", contract.commodityId)).collect(),
      ]);

      const allocatedDeposits = await Promise.all(
        allocations.map((allocation) => ctx.db.get(allocation.depositId)),
      );
      const allocatedWeightKg = allocations.reduce(
        (total, allocation) => total + allocation.allocatedWeightKg,
        0,
      );
      const candidateWeightKg = readyDeposits
        .filter((deposit) => deposit.status === "quality_checked")
        .reduce((total, deposit) => total + deposit.weightKg, 0);
      const contributors = new Set(allocatedDeposits.filter((deposit) => deposit !== null).map((deposit) => deposit.memberId));
      const scoreValues = allocatedDeposits
        .map((deposit) => deposit?.qualityScore)
        .filter((score): score is number => typeof score === "number");
      const gradeValues = allocatedDeposits
        .map((deposit) => deposit?.qualityGrade ?? legacyQualityGrade(deposit?.qualityScore))
        .filter((grade): grade is "A" | "B" | "C" | "D" => Boolean(grade));
      const poolQualityScore =
        scoreValues.length > 0
          ? Math.round(
              scoreValues.reduce((total, score) => total + score, 0) /
                scoreValues.length,
            )
          : null;

      statuses.push({
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        commodityName: commodity?.name ?? contract.commodityKey ?? "Komoditas tidak ditemukan",
        targetVolumeKg: contract.targetVolumeKg,
        allocatedWeightKg,
        candidateWeightKg,
        contributors: contributors.size,
        allocationCount: allocations.length,
        poolQualityScore,
        poolQualityGrade: gradeValues.length > 0
          ? gradeValues.sort((a, b) => ["A", "B", "C", "D"].indexOf(a) - ["A", "B", "C", "D"].indexOf(b))[0]
          : null,
        percentAllocated: Math.min(
          100,
          Math.round((allocatedWeightKg / contract.targetVolumeKg) * 100),
        ),
      });
    }

    return statuses.sort((a, b) => b.percentAllocated - a.percentAllocated);
  },
});

export const inventoryBalance = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const koperasi = await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first();
    if (!koperasi) throw new Error("Profil koperasi belum tersedia.");

    const [deposits, pools] = await Promise.all([
      ctx.db.query("deposits").withIndex("by_koperasi", (q) => q.eq("koperasiId", koperasi._id)).collect(),
      ctx.db.query("supplyPools").withIndex("by_koperasi", (q) => q.eq("koperasiId", koperasi._id)).collect(),
    ]);
    const balances = new Map<string, { commodityName: string; inboundKg: number; outboundKg: number; qualityTotal: number; qualityCount: number; qualityGrade: "A" | "B" | "C" | "D" | null }>();

    for (const deposit of deposits) {
      if (deposit.status === "rejected") continue;
      const commodity = await ctx.db.get(deposit.commodityId);
      if (!commodity) continue;
      const current = balances.get(deposit.commodityId) ?? { commodityName: commodity.name, inboundKg: 0, outboundKg: 0, qualityTotal: 0, qualityCount: 0, qualityGrade: null };
      current.inboundKg += deposit.weightKg;
      if (typeof deposit.qualityScore === "number") {
        current.qualityTotal += deposit.qualityScore;
        current.qualityCount += 1;
      }
      current.qualityGrade = betterGrade(current.qualityGrade, deposit.qualityGrade ?? legacyQualityGrade(deposit.qualityScore));
      balances.set(deposit.commodityId, current);
    }

    for (const pool of pools) {
      if (pool.status !== "allocated") continue;
      const contract = await ctx.db.get(pool.contractId);
      if (!contract) continue;
      const commodity = await ctx.db.get(contract.commodityId);
      if (!commodity) continue;
      const current = balances.get(contract.commodityId) ?? { commodityName: commodity.name, inboundKg: 0, outboundKg: 0, qualityTotal: 0, qualityCount: 0, qualityGrade: null };
      current.outboundKg += pool.allocatedWeightKg;
      balances.set(contract.commodityId, current);
    }

    return Array.from(balances.entries()).map(([commodityId, balance]) => ({
      commodityId,
      commodityName: balance.commodityName,
      inboundKg: balance.inboundKg,
      outboundKg: balance.outboundKg,
      balanceKg: Math.max(balance.inboundKg - balance.outboundKg, 0),
      averageQualityScore: balance.qualityCount > 0 ? Math.round(balance.qualityTotal / balance.qualityCount) : null,
      qualityGrade: balance.qualityGrade,
    })).sort((a, b) => b.balanceKg - a.balanceKg);
  },
});
