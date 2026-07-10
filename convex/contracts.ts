import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

type QualityGrade = "A" | "B" | "C" | "D";

function legacyGrade(score: number | undefined) : QualityGrade {
  if (typeof score !== "number") return "D";
  if (score >= 90) return "A";
  if (score >= 82) return "B";
  if (score >= 70) return "C";
  return "D";
}

export const createContract = mutation({
  args: {
    token: v.string(),
    commodityId: v.id("commodities"),
    contractNumber: v.string(),
    title: v.optional(v.string()),
    targetVolumeKg: v.number(),
    minimumQualityGrade: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D")),
    pricePerKg: v.number(),
    deadlineAt: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["buyer"]);
    const commodity = await ctx.db.get(args.commodityId);

    if (!commodity) {
      throw new Error("Komoditas tidak ditemukan.");
    }

    if (args.targetVolumeKg <= 0 || args.pricePerKg <= 0) {
      throw new Error("Volume dan harga kontrak harus lebih dari 0.");
    }

    return ctx.db.insert("contracts", {
      buyerId: actor._id,
      commodityId: args.commodityId,
      contractNumber: args.contractNumber,
      title: args.title,
      targetVolumeKg: args.targetVolumeKg,
      fulfilledVolumeKg: 0,
      fulfillmentPercent: 0,
      minimumQualityGrade: args.minimumQualityGrade,
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
    token: v.string(),
    contractId: v.id("contracts"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.token, ["buyer"]);
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

export const listAllContracts = query({
  args: {
    token: v.string(),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("completed"), v.literal("cancelled"))),
    commodityId: v.optional(v.id("commodities")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.token, ["admin"]);
    const contracts = await ctx.db.query("contracts").collect();
    const filtered = contracts.filter((contract) => (!args.status || contract.status === args.status) && (!args.commodityId || contract.commodityId === args.commodityId));
    return Promise.all(filtered.sort((a, b) => a.deadlineAt - b.deadlineAt).map(async (contract) => {
      const [buyer, commodity, koperasi] = await Promise.all([
        ctx.db.get(contract.buyerId),
        ctx.db.get(contract.commodityId),
        contract.koperasiId ? ctx.db.get(contract.koperasiId) : Promise.resolve(null),
      ]);
      return {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        title: contract.title ?? null,
        buyerName: buyer?.name ?? "Buyer tidak ditemukan",
        koperasiName: koperasi?.name ?? "Koperasi tidak ditemukan",
        commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
        targetVolumeKg: contract.targetVolumeKg,
        fulfilledVolumeKg: contract.fulfilledVolumeKg ?? 0,
        fulfillmentPercent: contract.fulfillmentPercent ?? 0,
        minimumQualityScore: contract.minimumQualityScore,
        minimumQualityGrade: contract.minimumQualityGrade ?? legacyGrade(contract.minimumQualityScore),
        pricePerKg: contract.pricePerKg,
        deadlineAt: contract.deadlineAt,
        status: contract.status,
      };
    }));
  },
});

export const listContracts = query({
  args: {
    token: v.string(),
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
    const actor = await requireRole(ctx, args.token, ["cooperative", "buyer"]);
    const contracts = await ctx.db.query("contracts").collect();
    const filtered = contracts.filter((contract) => {
      const ownerMatches = actor.role === "buyer" ? contract.buyerId === actor._id : true;
      const statusMatches = actor.role === "cooperative"
        ? contract.status === "active"
        : args.status
          ? contract.status === args.status
          : true;
      const commodityMatches = args.commodityId
        ? contract.commodityId === args.commodityId
        : true;
      return ownerMatches && statusMatches && commodityMatches;
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
            minimumQualityGrade: contract.minimumQualityGrade ?? legacyGrade(contract.minimumQualityScore),
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
    token: v.string(),
    contractId: v.id("contracts"),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["admin", "cooperative", "buyer"]);
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      return null;
    }
    if (actor.role === "buyer" && contract.buyerId !== actor._id) throw new Error("Akses kontrak ditolak.");

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
          qualityGrade: allocation.qualityGradeSnapshot,
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
      minimumQualityGrade: contract.minimumQualityGrade ?? legacyGrade(contract.minimumQualityScore),
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
            qualityGrade: allocation.qualityGradeSnapshot,
            status: allocation.status,
            notes: allocation.notes ?? null,
            allocatedAt: allocation.allocatedAt,
          };
        }),
    );
  },
});
