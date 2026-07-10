import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createMember = mutation({
  args: {
    koperasiId: v.id("koperasiProfiles"),
    name: v.string(),
    phone: v.string(),
    village: v.optional(v.string()),
    primaryCommodityId: v.optional(v.id("commodities")),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("members", {
      koperasiId: args.koperasiId,
      name: args.name,
      phone: args.phone,
      village: args.village,
      primaryCommodityId: args.primaryCommodityId,
      status: "active",
      joinedAt: Date.now(),
    }),
});

export const updateMember = mutation({
  args: {
    memberId: v.id("members"),
    name: v.string(),
    phone: v.string(),
    village: v.optional(v.string()),
    primaryCommodityId: v.optional(v.id("commodities")),
    status: v.optional(v.union(v.literal("active"), v.literal("needs_verification"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      name: args.name,
      phone: args.phone,
      village: args.village,
      primaryCommodityId: args.primaryCommodityId,
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const deleteMember = mutation({
  args: {
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.memberId);
  },
});

const qualityRuleValidator = v.object({
  name: v.string(),
  minimum: v.optional(v.number()),
  maximum: v.optional(v.number()),
  weight: v.number(),
});

export const createCommodity = mutation({
  args: {
    name: v.string(),
    unit: v.string(),
    qualityParameters: v.array(v.string()),
    qualityRules: v.optional(v.array(qualityRuleValidator)),
    minimumQualityScore: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("commodities", {
      name: args.name,
      unit: args.unit,
      qualityParameters: args.qualityParameters,
      qualityRules: args.qualityRules,
      minimumQualityScore: args.minimumQualityScore,
      status: "active",
      createdAt: Date.now(),
    }),
});

export const updateCommodity = mutation({
  args: {
    commodityId: v.id("commodities"),
    name: v.string(),
    unit: v.string(),
    qualityParameters: v.array(v.string()),
    qualityRules: v.optional(v.array(qualityRuleValidator)),
    minimumQualityScore: v.number(),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commodityId, {
      name: args.name,
      unit: args.unit,
      qualityParameters: args.qualityParameters,
      qualityRules: args.qualityRules,
      minimumQualityScore: args.minimumQualityScore,
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCommodity = mutation({
  args: {
    commodityId: v.id("commodities"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commodityId);
  },
});

export const searchMembers = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .withIndex("by_koperasi", (q) => q.eq("koperasiId", args.koperasiId))
      .collect();

    const normalizedSearch = args.searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return members;
    }

    return members.filter((member) =>
      member.name.toLowerCase().includes(normalizedSearch)
    );
  },
});

export const searchCommodities = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const commodities = await ctx.db.query("commodities").collect();

    const normalizedSearch = args.searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return commodities;
    }

    return commodities.filter((commodity) =>
      commodity.name.toLowerCase().includes(normalizedSearch)
    );
  },
});
