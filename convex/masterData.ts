import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireRole } from "./auth";

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

export const verifyMember = mutation({
  args: {
    token: v.string(),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const [member, koperasi] = await Promise.all([
      ctx.db.get(args.memberId),
      ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first(),
    ]);
    if (!member || !koperasi || member.koperasiId !== koperasi._id) {
      throw new Error("Anggota bukan milik koperasi ini.");
    }
    await ctx.db.patch(args.memberId, {
      status: "active",
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

export function normalizeCommodityKey(name: string) {
  return name.trim().toLocaleLowerCase('id-ID').replace(/\s+/g, ' ');
}

export const createCommodity = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    unit: v.string(),
    qualityParameters: v.array(v.string()),
    minimumQualityScore: v.number(),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["admin", "cooperative"]);
    const koperasi = actor.role === "cooperative"
      ? await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first()
      : null;
    const commodityKey = normalizeCommodityKey(args.name);
    const existing = await ctx.db.query("commodities").collect();
    if (existing.some((commodity) => normalizeCommodityKey(commodity.name) === commodityKey && commodity.status !== "inactive")) {
      throw new Error("Komoditas dengan nama tersebut sudah tersedia. Tambahkan dari jaringan komoditas.");
    }
    const commodityId = await ctx.db.insert("commodities", {
      createdByKoperasiId: koperasi?._id,
      commodityKey,
      name: args.name,
      unit: args.unit,
      qualityParameters: args.qualityParameters,
      minimumQualityScore: args.minimumQualityScore,
      status: "active",
      createdAt: Date.now(),
    });
    if (koperasi) {
      await ctx.db.insert("koperasiCommodities", {
        koperasiId: koperasi._id,
        commodityId,
        status: "active",
        minimumQualityScore: args.minimumQualityScore,
        createdAt: Date.now(),
      });
    }
    return commodityId;
  },
});

export const updateCommodity = mutation({
  args: {
    token: v.string(),
    commodityId: v.id("commodities"),
    name: v.string(),
    unit: v.string(),
    qualityParameters: v.array(v.string()),
    minimumQualityScore: v.number(),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["admin", "cooperative"]);
    const commodity = await ctx.db.get(args.commodityId);
    if (!commodity) throw new Error("Komoditas tidak ditemukan.");
    if (actor.role === "cooperative") {
      const koperasi = await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first();
      if (!koperasi || commodity.createdByKoperasiId !== koperasi._id) throw new Error("Hanya pembuat komoditas yang dapat mengubahnya.");
    }
    await ctx.db.patch(args.commodityId, {
      commodityKey: normalizeCommodityKey(args.name),
      name: args.name,
      unit: args.unit,
      qualityParameters: args.qualityParameters,
      minimumQualityScore: args.minimumQualityScore,
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCommodity = mutation({
  args: {
    token: v.string(),
    commodityId: v.id("commodities"),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["admin", "cooperative"]);
    const commodity = await ctx.db.get(args.commodityId);
    if (!commodity) throw new Error("Komoditas tidak ditemukan.");
    if (actor.role === "cooperative") {
      const koperasi = await ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first();
      if (!koperasi || commodity.createdByKoperasiId !== koperasi._id) throw new Error("Hanya pembuat komoditas yang dapat menghapusnya.");
    }
    await ctx.db.delete(args.commodityId);
  },
});

export const updateCommodityStatus = mutation({
  args: {
    token: v.string(),
    commodityId: v.id("commodities"),
    status: v.union(v.literal("active"), v.literal("inactive")),
    minimumQualityScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const commodity = await ctx.db.get(args.commodityId);
    const koperasi = await ctx.db
      .query("koperasiProfiles")
      .withIndex("by_admin", (q) => q.eq("adminId", actor._id))
      .first();
    if (!commodity || !koperasi) {
      throw new Error("Komoditas atau profil koperasi tidak ditemukan.");
    }
    const existing = await ctx.db
      .query("koperasiCommodities")
      .withIndex("by_koperasi_and_commodity", (q) => q.eq("koperasiId", koperasi._id).eq("commodityId", args.commodityId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("koperasiCommodities", {
        koperasiId: koperasi._id,
        commodityId: args.commodityId,
        status: args.status,
        minimumQualityScore: args.minimumQualityScore,
        createdAt: Date.now(),
      });
    }
  },
});

export const adoptCommodity = mutation({
  args: {
    token: v.string(),
    commodityId: v.id("commodities"),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["cooperative"]);
    const [commodity, koperasi] = await Promise.all([
      ctx.db.get(args.commodityId),
      ctx.db.query("koperasiProfiles").withIndex("by_admin", (q) => q.eq("adminId", actor._id)).first(),
    ]);
    if (!commodity || commodity.status === "inactive") throw new Error("Komoditas tidak tersedia.");
    if (!koperasi) throw new Error("Profil koperasi belum tersedia.");
    const existing = await ctx.db.query("koperasiCommodities").withIndex("by_koperasi_and_commodity", (q) => q.eq("koperasiId", koperasi._id).eq("commodityId", args.commodityId)).first();
    if (existing) {
      await ctx.db.patch(existing._id, { status: "active", updatedAt: Date.now() });
      return existing._id;
    }
    return ctx.db.insert("koperasiCommodities", {
      koperasiId: koperasi._id,
      commodityId: args.commodityId,
      status: "active",
      minimumQualityScore: commodity.minimumQualityScore,
      createdAt: Date.now(),
    });
  },
});

export const migrateCommoditiesToKoperasi = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.token, ["admin"]);
    const profiles = await ctx.db.query("koperasiProfiles").collect();
    const commodities = await ctx.db.query("commodities").collect();
    const deposits = await ctx.db.query("deposits").collect();
    const members = await ctx.db.query("members").collect();
    const contracts = await ctx.db.query("contracts").collect();
    let created = 0;
    const globalByKey = new Map<string, Id<"commodities">>();
    const relationExists = async (koperasiId: Id<"koperasiProfiles">, commodityId: Id<"commodities">) =>
      Boolean(await ctx.db.query("koperasiCommodities").withIndex("by_koperasi_and_commodity", (q) => q.eq("koperasiId", koperasiId).eq("commodityId", commodityId)).first());

    for (const commodity of commodities.filter((item) => !item.koperasiId)) {
      globalByKey.set(commodity.commodityKey ?? normalizeCommodityKey(commodity.name), commodity._id);
    }

    for (const source of commodities) {
      if (!source.koperasiId && source.status === undefined) {
        await ctx.db.patch(source._id, { status: "active" });
      }
      const key = source.commodityKey ?? normalizeCommodityKey(source.name);
      let globalId = globalByKey.get(key);
      if (!globalId) {
        globalId = await ctx.db.insert("commodities", {
          createdByKoperasiId: source.koperasiId,
          name: source.name,
          unit: source.unit,
          qualityParameters: source.qualityParameters,
          minimumQualityScore: source.minimumQualityScore,
          status: source.status ?? "active",
          createdAt: Date.now(),
        });
        globalByKey.set(key, globalId);
        created += 1;
      }

      const sourceProfiles = source.koperasiId
        ? profiles.filter((profile) => profile._id === source.koperasiId)
        : profiles;
      for (const profile of sourceProfiles) {
        if (await relationExists(profile._id, globalId)) continue;
        await ctx.db.insert("koperasiCommodities", {
          koperasiId: profile._id,
          commodityId: globalId,
          status: source.status ?? "active",
          minimumQualityScore: source.minimumQualityScore,
          createdAt: Date.now(),
        });
      }

      if (source._id !== globalId) {
        for (const deposit of deposits.filter((item) => item.commodityId === source._id)) {
          await ctx.db.patch(deposit._id, { commodityId: globalId });
        }
        for (const member of members.filter((item) => item.primaryCommodityId === source._id)) {
          await ctx.db.patch(member._id, { primaryCommodityId: globalId });
        }
      }
    }

    for (const contract of contracts) {
      const oldCommodity = await ctx.db.get(contract.commodityId);
      const key = contract.commodityKey ?? (oldCommodity ? oldCommodity.commodityKey ?? normalizeCommodityKey(oldCommodity.name) : null);
      const globalId = key ? globalByKey.get(key) : undefined;
      if (globalId && key) await ctx.db.patch(contract._id, { commodityId: globalId, commodityKey: key });
    }
    return { created };
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
    token: v.optional(v.string()),
    koperasiId: v.optional(v.id("koperasiProfiles")),
  },
  handler: async (ctx, args) => {
    const commodities = (await ctx.db.query("commodities").collect())
      .filter((commodity) => commodity.status !== "inactive");
    const normalizedSearch = args.searchTerm.trim().toLowerCase();

    if (args.token) {
      const actor = await requireRole(ctx, args.token, ["admin", "cooperative", "buyer"]);
      if (actor.role === "cooperative") {
        const koperasi = await ctx.db
          .query("koperasiProfiles")
          .withIndex("by_admin", (q) => q.eq("adminId", actor._id))
          .first();
        if (!koperasi) return [];
        const relations = await ctx.db.query("koperasiCommodities").withIndex("by_koperasi", (q) => q.eq("koperasiId", koperasi._id)).collect();
        const activeIds = new Set(relations.filter((relation) => relation.status === "active").map((relation) => relation.commodityId));
        return commodities.filter((commodity) => activeIds.has(commodity._id) && (!normalizedSearch || commodity.name.toLowerCase().includes(normalizedSearch)));
      } else if (actor.role === "buyer") {
        const relations = await ctx.db.query("koperasiCommodities").collect();
        const activeRelations = relations.filter((relation) => relation.status === "active");
        const normalizedSearch = args.searchTerm.trim().toLowerCase();
        const grouped = new Map<string, {
          _id: string;
          commodityKey: string;
          name: string;
          unit: string;
          minimumQualityScore: number;
          koperasiCount: number;
          koperasiNames: string[];
        }>();
        for (const relation of activeRelations) {
          const commodity = commodities.find((item) => item._id === relation.commodityId);
          if (!commodity || (normalizedSearch && !commodity.name.toLowerCase().includes(normalizedSearch))) continue;
          if (grouped.has(commodity._id)) continue;
          const matching = activeRelations.filter((item) => item.commodityId === commodity._id);
          const koperasiNames = (await Promise.all(matching.map(async (item) => {
            const profile = item.koperasiId ? await ctx.db.get(item.koperasiId) : null;
            return profile?.name ?? null;
          }))).filter((name): name is string => Boolean(name));
          grouped.set(commodity._id, {
            _id: commodity._id,
            commodityKey: commodity._id,
            name: commodity.name,
            unit: commodity.unit,
            minimumQualityScore: Math.min(...matching.map((item) => item.minimumQualityScore ?? 0)),
            koperasiCount: matching.length,
            koperasiNames,
          });
        }
        return Array.from(grouped.values());
      }
    }

    return commodities.filter((commodity) =>
      !normalizedSearch || commodity.name.toLowerCase().includes(normalizedSearch),
    );
  },
});

export const listManagedCommodities = query({
  args: {
    token: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["admin", "cooperative"]);
    const commodities = await ctx.db.query("commodities").collect();
    const relations = await ctx.db.query("koperasiCommodities").collect();
    const koperasi = actor.role === "cooperative"
      ? await ctx.db
          .query("koperasiProfiles")
          .withIndex("by_admin", (q) => q.eq("adminId", actor._id))
          .first()
      : null;
    const normalizedSearch = args.searchTerm.trim().toLowerCase();

    const rows = commodities.filter((commodity) => !commodity.koperasiId);

    return Promise.all(rows
      .filter((commodity) => !normalizedSearch || commodity.name.toLowerCase().includes(normalizedSearch))
      .map(async (commodity) => ({
        ...commodity,
        enabled: actor.role === "cooperative" && koperasi
          ? commodity.status !== "inactive" && relations.some((relation) => relation.koperasiId === koperasi._id && relation.commodityId === commodity._id && relation.status === "active")
          : commodity.status !== "inactive",
        koperasiName: actor.role === "admin" ? `${relations.filter((relation) => relation.commodityId === commodity._id && relation.status === "active").length} koperasi aktif` : null,
      })));
  },
});

export const listCommodityNetwork = query({
  args: { token: v.string(), searchTerm: v.string() },
  handler: async (ctx, args) => {
    const actor = await requireRole(ctx, args.token, ["admin", "cooperative"]);
    const commodities = (await ctx.db.query("commodities").collect()).filter((commodity) => commodity.status !== "inactive");
    const relations = await ctx.db.query("koperasiCommodities").collect();
    const profiles = await ctx.db.query("koperasiProfiles").collect();
    const koperasi = actor.role === "cooperative"
      ? profiles.find((profile) => profile.adminId === actor._id)
      : null;
    const normalizedSearch = args.searchTerm.trim().toLowerCase();

    return commodities
      .filter((commodity) => !normalizedSearch || commodity.name.toLowerCase().includes(normalizedSearch))
      .map((commodity) => {
        const ownRelation = koperasi ? relations.find((relation) => relation.koperasiId === koperasi._id && relation.commodityId === commodity._id) : null;
        const activeProviders = relations.filter((relation) => relation.commodityId === commodity._id && relation.status === "active");
        const owner = commodity.createdByKoperasiId ? profiles.find((profile) => profile._id === commodity.createdByKoperasiId) : null;
        return {
          commodityId: commodity._id,
          name: commodity.name,
          unit: commodity.unit,
          qualityParameters: commodity.qualityParameters,
          minimumQualityScore: ownRelation?.minimumQualityScore ?? commodity.minimumQualityScore,
          status: ownRelation?.status ?? "not_added",
          ownerName: owner?.name ?? "Admin",
          createdByKoperasiId: commodity.createdByKoperasiId ?? null,
          activeProviderCount: activeProviders.length,
          otherActiveProviderCount: Math.max(activeProviders.length - (ownRelation?.status === "active" ? 1 : 0), 0),
          canEdit: actor.role === "admin" || commodity.createdByKoperasiId === koperasi?._id,
        };
      });
  },
});
