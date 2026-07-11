import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

export const saveKoperasiProfile = mutation({
  args: {
    adminId: v.id("users"),
    name: v.string(),
    location: v.string(),
    address: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    leaderName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("koperasiProfiles")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        location: args.location,
        address: args.address,
        contactEmail: args.contactEmail,
        contactPhone: args.contactPhone,
        leaderName: args.leaderName,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("koperasiProfiles", {
        adminId: args.adminId,
        name: args.name,
        location: args.location,
        address: args.address,
        contactEmail: args.contactEmail,
        contactPhone: args.contactPhone,
        leaderName: args.leaderName,
        createdAt: Date.now(),
      });
    }
  },
});

export const getKoperasiProfile = query({
  args: {
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("koperasiProfiles")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .first();
  },
});

export const getDefaultKoperasi = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("koperasiProfiles").first();
  },
});

export const getCurrentKoperasi = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, args.token, ["cooperative"]);
    return await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", user._id)).first();
  },
});

export const listKoperasiProfiles = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.token, ["admin"]);
    return await ctx.db.query("koperasiProfiles").collect();
  },
});

export const saveDefaultKoperasi = mutation({
  args: {
    token: v.string(),
    adminId: v.id("users"),
    name: v.string(),
    location: v.string(),
    address: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    leaderName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    if (actor._id !== args.adminId) throw new Error("Akses profil koperasi ditolak.");
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new Error("Admin koperasi tidak ditemukan.");
    }

    let profile = await ctx.db
      .query("koperasiProfiles")
      .withIndex("by_admin", (q) => q.eq("adminId", actor._id))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, {
        name: args.name,
        location: args.location,
        address: args.address,
        contactEmail: args.contactEmail,
        contactPhone: args.contactPhone,
        leaderName: args.leaderName,
        updatedAt: Date.now(),
      });
      return profile._id;
    } else {
      return await ctx.db.insert("koperasiProfiles", {
        adminId: args.adminId,
        name: args.name,
        location: args.location,
        address: args.address,
        contactEmail: args.contactEmail,
        contactPhone: args.contactPhone,
        leaderName: args.leaderName,
        createdAt: Date.now(),
      });
    }
  },
});

export const getCooperativeOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const profile = await ctx.db
      .query("koperasiProfiles")
      .withIndex("by_admin", (q) => q.eq("adminId", actor._id))
      .first();
    if (!profile) return null;

    const [members, relations, contracts, pools] = await Promise.all([
      ctx.db.query("members").withIndex("by_koperasi", (q) => q.eq("koperasiId", profile._id)).collect(),
      ctx.db.query("koperasiCommodities").withIndex("by_koperasi", (q) => q.eq("koperasiId", profile._id)).collect(),
      ctx.db.query("contracts").withIndex("by_status", (q) => q.eq("status", "active")).collect(),
      ctx.db.query("supplyPools").withIndex("by_koperasi", (q) => q.eq("koperasiId", profile._id)).collect(),
    ]);
    const activeCommodityIds = new Set(
      relations.filter((relation) => relation.status === "active").map((relation) => relation.commodityId),
    );
    const activeContracts = contracts.filter((contract) => activeCommodityIds.has(contract.commodityId));
    const allocatedWeightKg = pools
      .filter((pool) => pool.status === "allocated")
      .reduce((total, pool) => total + pool.allocatedWeightKg, 0);

    return {
      profile,
      memberCount: members.length,
      activeCommodityCount: activeCommodityIds.size,
      activeContractCount: activeContracts.length,
      allocatedWeightKg,
    };
  },
});

export const listCooperativeCommodityCatalog = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const profile = await ctx.db
      .query("koperasiProfiles")
      .withIndex("by_admin", (q) => q.eq("adminId", actor._id))
      .first();
    if (!profile) return [];

    const [commodities, relations, allRelations] = await Promise.all([
      ctx.db.query("commodities").collect(),
      ctx.db.query("koperasiCommodities").withIndex("by_koperasi", (q) => q.eq("koperasiId", profile._id)).collect(),
      ctx.db.query("koperasiCommodities").collect(),
    ]);
    const ownRelations = new Map(relations.map((relation) => [relation.commodityId, relation]));

    return commodities
      .filter((commodity) => commodity.status !== "inactive")
      .map((commodity) => {
        const relation = ownRelations.get(commodity._id);
        const activeProviderCount = allRelations.filter(
          (item) => item.commodityId === commodity._id && item.status === "active",
        ).length;
        return {
          commodityId: commodity._id,
          name: commodity.name,
          unit: commodity.unit,
          minimumQualityScore: relation?.minimumQualityScore ?? commodity.minimumQualityScore,
          status: relation?.status ?? "not_added",
          activeProviderCount,
          otherActiveProviderCount: Math.max(activeProviderCount - (relation?.status === "active" ? 1 : 0), 0),
        };
      });
  },
});
