import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const saveDefaultKoperasi = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    address: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    leaderName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let profile = await ctx.db.query("koperasiProfiles").first();
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
      let admin = await ctx.db.query("users").first();
      if (!admin) {
        const adminId = await ctx.db.insert("users", {
          name: "Admin Koperasi",
          email: "admin@koperasi.id",
          role: "cooperative",
          joinedAt: Date.now(),
          passwordHash: "mock_hash",
        });
        admin = await ctx.db.get(adminId);
      }
      return await ctx.db.insert("koperasiProfiles", {
        adminId: admin!._id,
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
