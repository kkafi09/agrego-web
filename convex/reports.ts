import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const calculateContractProfitShares = mutation({
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
    const activeAllocations = allocations.filter(
      (allocation) => allocation.status === "allocated",
    );
    const weightedTotal = activeAllocations.reduce(
      (total, allocation) =>
        total + allocation.allocatedWeightKg * (allocation.qualityScoreSnapshot ?? 0),
      0,
    );

    if (weightedTotal <= 0) {
      throw new Error("Belum ada alokasi valid untuk dihitung.");
    }

    const contractValue =
      activeAllocations.reduce(
        (total, allocation) => total + allocation.allocatedWeightKg,
        0,
      ) * contract.pricePerKg;
    const calculatedAt = Date.now();
    const shareIds = [];

    for (const allocation of activeAllocations) {
      const deposit = await ctx.db.get(allocation.depositId);
      if (!deposit) {
        continue;
      }

      const weight =
        allocation.allocatedWeightKg * (allocation.qualityScoreSnapshot ?? 0);
      const amountEarned = Math.round((weight / weightedTotal) * contractValue);
      const shareId = await ctx.db.insert("profitShares", {
        contractId: args.contractId,
        poolId: allocation._id,
        memberId: deposit.memberId,
        contributedWeightKg: allocation.allocatedWeightKg,
        qualityScore: allocation.qualityScoreSnapshot ?? 0,
        amountEarned,
        calculatedAt,
      });
      shareIds.push(shareId);
    }

    return {
      shareIds,
      totalAmount: contractValue,
    };
  },
});

export const profitShareHistory = query({
  args: {
    contractId: v.optional(v.id("contracts")),
  },
  handler: async (ctx, args) => {
    const shares = args.contractId
      ? await ctx.db
          .query("profitShares")
          .withIndex("by_contract", (q) => q.eq("contractId", args.contractId!))
          .collect()
      : await ctx.db.query("profitShares").collect();

    return Promise.all(
      shares
        .sort((a, b) => b.calculatedAt - a.calculatedAt)
        .map(async (share) => {
          const [member, contract] = await Promise.all([
            ctx.db.get(share.memberId),
            ctx.db.get(share.contractId),
          ]);

          return {
            shareId: share._id,
            contractNumber: contract?.contractNumber ?? null,
            memberName: member?.name ?? "Anggota tidak ditemukan",
            contributedWeightKg: share.contributedWeightKg,
            qualityScore: share.qualityScore,
            amountEarned: share.amountEarned,
            calculatedAt: share.calculatedAt,
          };
        }),
    );
  },
});

export const memberProfitShareDetail = query({
  args: {
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      return null;
    }

    const shares = await ctx.db
      .query("profitShares")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();
    const totalAmount = shares.reduce((total, share) => total + share.amountEarned, 0);
    const totalWeightKg = shares.reduce(
      (total, share) => total + share.contributedWeightKg,
      0,
    );

    return {
      memberId: member._id,
      memberName: member.name,
      phone: member.phone,
      totalAmount,
      totalWeightKg,
      shareCount: shares.length,
      shares,
    };
  },
});
