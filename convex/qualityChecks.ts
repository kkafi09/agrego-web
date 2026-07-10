import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

type SizeGrade = "A" | "B" | "C" | "D";
type QualityDecision = "priority" | "passed" | "held";

function legacyQualityGrade(score: number | undefined): SizeGrade {
  if (typeof score !== "number") return "D";
  if (score >= 90) return "A";
  if (score >= 82) return "B";
  if (score >= 70) return "C";
  return "D";
}

export function calculateQualityGrade(qualityGrade: SizeGrade) {
  return qualityGrade;
}

export function getQualityDecision(grade: SizeGrade): QualityDecision {
  if (grade === "A") {
    return "priority";
  }

  if (grade === "B" || grade === "C") {
    return "passed";
  }

  return "held";
}

export const previewQualityScore = query({
  args: {
    qualityGrade: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D")),
  },
  handler: async (_ctx, args) => {
    const qualityGrade = calculateQualityGrade(args.qualityGrade);

    return {
      qualityGrade,
      decision: getQualityDecision(qualityGrade),
    };
  },
});

export const saveQualityCheck = mutation({
  args: {
    depositId: v.id("deposits"),
    qualityGrade: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D")),
    defectPercent: v.number(),
    inspectorName: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) {
      throw new Error("Setoran tidak ditemukan.");
    }

    if (args.defectPercent < 0) {
      throw new Error("Kerusakan tidak boleh bernilai negatif.");
    }

    const qualityGrade = calculateQualityGrade(args.qualityGrade);
    const decision = getQualityDecision(qualityGrade);
    const checkedAt = Date.now();
    const qcData = {
      qualityGrade: args.qualityGrade,
      defectPercent: args.defectPercent,
      notes: args.notes,
    };
    const qualityCheckId = await ctx.db.insert("qualityChecks", {
      koperasiId: deposit.koperasiId,
      depositId: args.depositId,
      qualityGrade: args.qualityGrade,
      defectPercent: args.defectPercent,
      decision,
      inspectorName: args.inspectorName,
      notes: args.notes,
      checkedAt,
    });

    await ctx.db.patch(args.depositId, {
      qualityGrade,
      qualityDecision: decision,
      qualityCheckedAt: checkedAt,
      qcData,
      status: decision === "held" ? "rejected" : "quality_checked",
    });

    return {
      qualityCheckId,
      decision,
    };
  },
});

export const listQualityChecksByDeposit = query({
  args: {
    depositId: v.id("deposits"),
  },
  handler: async (ctx, args) => {
    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) {
      return null;
    }

    const [member, commodity, checks] = await Promise.all([
      ctx.db.get(deposit.memberId),
      ctx.db.get(deposit.commodityId),
      ctx.db
        .query("qualityChecks")
        .withIndex("by_deposit", (q) => q.eq("depositId", args.depositId))
        .collect(),
    ]);

    return {
      deposit: {
        id: deposit._id,
        depositNumber: deposit.depositNumber,
        memberName: member?.name ?? "Anggota tidak ditemukan",
        commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
        weightKg: deposit.weightKg,
        status: deposit.status,
      },
      checks: checks
        .sort((a, b) => b.checkedAt - a.checkedAt)
        .map((check) => ({
          id: check._id,
          qualityGrade: check.qualityGrade ?? check.sizeGrade ?? legacyQualityGrade(check.qualityScore),
          defectPercent: check.defectPercent,
          decision: check.decision,
          inspectorName: check.inspectorName,
          notes: check.notes ?? null,
          checkedAt: check.checkedAt,
        })),
    };
  },
});

export const listDepositsWithLatestQualityScore = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
  },
  handler: async (ctx, args) => {
    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_koperasi", (q) => q.eq("koperasiId", args.koperasiId))
      .collect();

    return Promise.all(
      deposits
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .map(async (deposit) => {
          const [member, commodity, checks] = await Promise.all([
            ctx.db.get(deposit.memberId),
            ctx.db.get(deposit.commodityId),
            ctx.db
              .query("qualityChecks")
              .withIndex("by_deposit", (q) => q.eq("depositId", deposit._id))
              .collect(),
          ]);
          const latestCheck = checks.sort((a, b) => b.checkedAt - a.checkedAt)[0];

          return {
            depositId: deposit._id,
            depositNumber: deposit.depositNumber,
            memberName: member?.name ?? "Anggota tidak ditemukan",
            commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
            weightKg: deposit.weightKg,
            submittedAt: deposit.submittedAt,
            status: deposit.status,
            latestQualityScore:
              latestCheck?.qualityScore ?? deposit.qualityScore ?? null,
            latestQualityGrade:
              latestCheck?.qualityGrade ?? latestCheck?.sizeGrade ?? deposit.qualityGrade ?? legacyQualityGrade(latestCheck?.qualityScore ?? deposit.qualityScore),
            latestDecision: latestCheck?.decision ?? null,
            latestCheckedAt: latestCheck?.checkedAt ?? null,
          };
        }),
    );
  },
});

export const listQualityChecks = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
  },
  handler: async (ctx, args) => {
    const checks = await ctx.db
      .query("qualityChecks")
      .withIndex("by_koperasi", (q) => q.eq("koperasiId", args.koperasiId))
      .collect();

    return Promise.all(
      checks
        .sort((a, b) => b.checkedAt - a.checkedAt)
        .map(async (check) => {
          const deposit = await ctx.db.get(check.depositId);
          const [member, commodity] = deposit
            ? await Promise.all([
                ctx.db.get(deposit.memberId),
                ctx.db.get(deposit.commodityId),
              ])
            : [null, null];

          return {
            id: check._id,
            depositId: check.depositId,
            depositNumber: deposit?.depositNumber ?? null,
            memberName: member?.name ?? "Anggota tidak ditemukan",
            commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
            qualityGrade: check.qualityGrade ?? check.sizeGrade ?? legacyQualityGrade(check.qualityScore),
            defectPercent: check.defectPercent,
            decision: check.decision,
            inspectorName: check.inspectorName,
            notes: check.notes ?? null,
            checkedAt: check.checkedAt,
          };
        }),
    );
  },
});

export const getQualityCheckById = query({
  args: {
    qualityCheckId: v.id("qualityChecks"),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db.get(args.qualityCheckId);
    if (!check) {
      return null;
    }

    const deposit = await ctx.db.get(check.depositId);
    const [member, commodity] = deposit
      ? await Promise.all([
          ctx.db.get(deposit.memberId),
          ctx.db.get(deposit.commodityId),
        ])
      : [null, null];

    return {
      id: check._id,
      depositId: check.depositId,
      depositNumber: deposit?.depositNumber ?? null,
      memberName: member?.name ?? "Anggota tidak ditemukan",
      commodityName: commodity?.name ?? "Komoditas tidak ditemukan",
      qualityGrade: check.qualityGrade ?? check.sizeGrade ?? legacyQualityGrade(check.qualityScore),
      defectPercent: check.defectPercent,
      decision: check.decision,
      inspectorName: check.inspectorName,
      notes: check.notes ?? null,
      checkedAt: check.checkedAt,
    };
  },
});
