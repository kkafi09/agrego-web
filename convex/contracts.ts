import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createContract = mutation({
  args: {
    buyerId: v.id("users"),
    koperasiId: v.id("koperasiProfiles"),
    commodityId: v.id("commodities"),
    contractNumber: v.string(),
    title: v.optional(v.string()),
    targetVolumeKg: v.number(),
    minimumQualityScore: v.number(),
    pricePerKg: v.number(),
    deadlineAt: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [buyer, koperasi, commodity] = await Promise.all([
      ctx.db.get(args.buyerId),
      ctx.db.get(args.koperasiId),
      ctx.db.get(args.commodityId),
    ]);

    if (!buyer || buyer.role !== "buyer") {
      throw new Error("Buyer tidak valid.");
    }

    if (!koperasi) {
      throw new Error("Koperasi tidak ditemukan.");
    }

    if (!commodity) {
      throw new Error("Komoditas tidak ditemukan.");
    }

    if (args.targetVolumeKg <= 0 || args.pricePerKg <= 0) {
      throw new Error("Volume dan harga kontrak harus lebih dari 0.");
    }

    if (args.minimumQualityScore < 0 || args.minimumQualityScore > 100) {
      throw new Error("Quality score minimum harus antara 0 sampai 100.");
    }

    return ctx.db.insert("contracts", {
      buyerId: args.buyerId,
      koperasiId: args.koperasiId,
      commodityId: args.commodityId,
      contractNumber: args.contractNumber,
      title: args.title,
      targetVolumeKg: args.targetVolumeKg,
      fulfilledVolumeKg: 0,
      fulfillmentPercent: 0,
      minimumQualityScore: args.minimumQualityScore,
      pricePerKg: args.pricePerKg,
      deadlineAt: args.deadlineAt,
      status: "active",
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const updateContractStatus = mutation({
  args: {
    contractId: v.id("contracts"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      throw new Error("Kontrak tidak ditemukan.");
    }

    await ctx.db.patch(args.contractId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const listContracts = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    commodityId: v.optional(v.id("commodities")),
  },
  handler: async (ctx, args) => {
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_koperasi", (q) => q.eq("koperasiId", args.koperasiId))
      .collect();
    const filtered = contracts.filter((contract) => {
      const statusMatches = args.status ? contract.status === args.status : true;
      const commodityMatches = args.commodityId
        ? contract.commodityId === args.commodityId
        : true;
      return statusMatches && commodityMatches;
    });

    return Promise.all(
      filtered
        .sort((a, b) => a.deadlineAt - b.deadlineAt)
        .map(async (contract) => {
          const [buyer, commodity] = await Promise.all([
            ctx.db.get(contract.buyerId),
            ctx.db.get(contract.commodityId),
          ]);

          return {
            contractId: contract._id,
            contractNumber: contract.contractNumber,
            title: contract.title ?? null,
            buyerName: buyer?.name ?? "Buyer tidak ditemukan",
            commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
            targetVolumeKg: contract.targetVolumeKg,
            fulfilledVolumeKg: contract.fulfilledVolumeKg ?? 0,
            fulfillmentPercent: contract.fulfillmentPercent ?? 0,
            minimumQualityScore: contract.minimumQualityScore,
            pricePerKg: contract.pricePerKg,
            deadlineAt: contract.deadlineAt,
            status: contract.status,
          };
        }),
    );
  },
});

export const getContractDetail = query({
  args: {
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      return null;
    }

    const [buyer, commodity, allocations] = await Promise.all([
      ctx.db.get(contract.buyerId),
      ctx.db.get(contract.commodityId),
      ctx.db
        .query("supplyPools")
        .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
        .collect(),
    ]);
    const activeAllocations = allocations.filter(
      (allocation) => allocation.status === "allocated",
    );
    const fulfilledVolumeKg = activeAllocations.reduce(
      (total, allocation) => total + allocation.allocatedWeightKg,
      0,
    );
    const fulfillmentPercent = Math.min(
      100,
      Math.round((fulfilledVolumeKg / contract.targetVolumeKg) * 100),
    );
    const allocationRows = await Promise.all(
      activeAllocations.map(async (allocation) => {
        const deposit = await ctx.db.get(allocation.depositId);
        const member = deposit ? await ctx.db.get(deposit.memberId) : null;

        return {
          allocationId: allocation._id,
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
      title: contract.title ?? null,
      buyerName: buyer?.name ?? "Buyer tidak ditemukan",
      commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
      targetVolumeKg: contract.targetVolumeKg,
      fulfilledVolumeKg,
      fulfillmentPercent,
      minimumQualityScore: contract.minimumQualityScore,
      pricePerKg: contract.pricePerKg,
      deadlineAt: contract.deadlineAt,
      status: contract.status,
      notes: contract.notes ?? null,
      allocations: allocationRows,
    };
  },
});

export const listContractAllocations = query({
  args: {
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
    const allocations = await ctx.db
      .query("supplyPools")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();

    return Promise.all(
      allocations
        .sort((a, b) => b.allocatedAt - a.allocatedAt)
        .map(async (allocation) => {
          const deposit = await ctx.db.get(allocation.depositId);
          const member = deposit ? await ctx.db.get(deposit.memberId) : null;

          return {
            allocationId: allocation._id,
            depositId: allocation.depositId,
            depositNumber: deposit?.depositNumber ?? null,
            memberName: member?.name ?? null,
            allocatedWeightKg: allocation.allocatedWeightKg,
            qualityScore: allocation.qualityScoreSnapshot,
            status: allocation.status,
            notes: allocation.notes ?? null,
            allocatedAt: allocation.allocatedAt,
          };
        }),
    );
  },
});
