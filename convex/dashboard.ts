import { v } from "convex/values";
import { query } from "./_generated/server";

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
        depositCount: summary.depositCount,
      }))
      .sort((a, b) => b.totalKg - a.totalKg);
  },
});

export const activeContractProgress = query({
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

    const progress = [];

    for (const contract of contracts) {
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
        commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
        targetVolumeKg: contract.targetVolumeKg,
        fulfilledKg,
        remainingKg: Math.max(contract.targetVolumeKg - fulfilledKg, 0),
        percent,
        minimumQualityScore: contract.minimumQualityScore,
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
    koperasiId: v.id("koperasiProfiles"),
  },
  handler: async (ctx, args) => {
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_koperasi_and_status", (q) =>
        q.eq("koperasiId", args.koperasiId).eq("status", "active"),
      )
      .collect();

    const statuses = [];

    for (const contract of contracts) {
      const [commodity, allocations, readyDeposits] = await Promise.all([
        ctx.db.get(contract.commodityId),
        ctx.db
          .query("supplyPools")
          .withIndex("by_contract", (q) => q.eq("contractId", contract._id))
          .collect(),
        ctx.db
          .query("deposits")
          .withIndex("by_koperasi_and_commodity", (q) =>
            q
              .eq("koperasiId", args.koperasiId)
              .eq("commodityId", contract.commodityId),
          )
          .collect(),
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
      const contributors = new Set(
        allocatedDeposits
          .filter((deposit) => deposit !== null)
          .map((deposit) => deposit.memberId),
      );
      const scoreValues = allocatedDeposits
        .map((deposit) => deposit?.qualityScore)
        .filter((score): score is number => typeof score === "number");
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
        commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
        targetVolumeKg: contract.targetVolumeKg,
        allocatedWeightKg,
        candidateWeightKg,
        contributors: contributors.size,
        allocationCount: allocations.length,
        poolQualityScore,
        percentAllocated: Math.min(
          100,
          Math.round((allocatedWeightKg / contract.targetVolumeKg) * 100),
        ),
      });
    }

    return statuses.sort((a, b) => b.percentAllocated - a.percentAllocated);
  },
});
