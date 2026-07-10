import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createDeposit = mutation({
  args: {
    koperasiId: v.id("koperasiProfiles"),
    memberId: v.id("members"),
    commodityId: v.id("commodities"),
    depositNumber: v.string(),
    weightKg: v.number(),
    submittedAt: v.number(),
    origin: v.optional(v.string()),
    collectorName: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [koperasi, member, commodity] = await Promise.all([
      ctx.db.get(args.koperasiId),
      ctx.db.get(args.memberId),
      ctx.db.get(args.commodityId),
    ]);

    if (!koperasi) {
      throw new Error("Profil koperasi tidak ditemukan.");
    }

    if (!member || member.koperasiId !== args.koperasiId) {
      throw new Error("Anggota tidak ditemukan pada koperasi ini.");
    }

    if (!commodity) {
      throw new Error("Komoditas tidak ditemukan.");
    }

    if (args.weightKg <= 0) {
      throw new Error("Berat setoran harus lebih dari 0 kg.");
    }

    return ctx.db.insert("deposits", {
      koperasiId: args.koperasiId,
      memberId: args.memberId,
      commodityId: args.commodityId,
      depositNumber: args.depositNumber,
      weightKg: args.weightKg,
      submittedAt: args.submittedAt,
      origin: args.origin ?? member.village ?? "",
      collectorName: args.collectorName,
      notes: args.notes,
      status: "recorded",
    });
  },
});

export const listDeposits = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
    status: v.optional(
      v.union(
        v.literal("recorded"),
        v.literal("quality_checked"),
        v.literal("allocated"),
        v.literal("rejected"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_koperasi", (q) => q.eq("koperasiId", args.koperasiId))
      .collect();
    const filtered = args.status
      ? deposits.filter((deposit) => deposit.status === args.status)
      : deposits;

    return Promise.all(
      filtered
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .map(async (deposit) => {
          const [member, commodity] = await Promise.all([
            ctx.db.get(deposit.memberId),
            ctx.db.get(deposit.commodityId),
          ]);

          return {
            id: deposit._id,
            depositNumber: deposit.depositNumber,
            memberName: member?.name ?? "Anggota tidak ditemukan",
            commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
            weightKg: deposit.weightKg,
            submittedAt: deposit.submittedAt,
            origin: deposit.origin ?? member?.village ?? null,
            collectorName: deposit.collectorName,
            status: deposit.status,
            qualityScore: deposit.qualityScore ?? null,
            qualityGrade: deposit.qualityGrade ?? null,
          };
        }),
    );
  },
});

export const getDepositById = query({
  args: {
    depositId: v.id("deposits"),
  },
  handler: async (ctx, args) => {
    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) {
      return null;
    }

    const [member, commodity, koperasi] = await Promise.all([
      ctx.db.get(deposit.memberId),
      ctx.db.get(deposit.commodityId),
      ctx.db.get(deposit.koperasiId),
    ]);

    return {
      id: deposit._id,
      depositNumber: deposit.depositNumber,
      koperasiName: koperasi?.name ?? "Koperasi tidak ditemukan",
      memberName: member?.name ?? "Anggota tidak ditemukan",
      memberPhone: member?.phone ?? null,
      commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
      weightKg: deposit.weightKg,
      submittedAt: deposit.submittedAt,
      origin: deposit.origin ?? member?.village ?? null,
      collectorName: deposit.collectorName,
      notes: deposit.notes ?? null,
      status: deposit.status,
      qualityScore: deposit.qualityScore ?? null,
      qualityGrade: deposit.qualityGrade ?? null,
      qcData: deposit.qcData ?? null,
    };
  },
});
