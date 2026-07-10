import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

type SizeGrade = "A" | "B" | "C";
type QualityDecision = "priority" | "passed" | "held";

export function calculateQualityScore({
  moisturePercent,
  sizeGrade,
  defectPercent,
}: {
  moisturePercent: number;
  sizeGrade: SizeGrade;
  defectPercent: number;
}) {
  const moisturePenalty =
    moisturePercent < 10
      ? (10 - moisturePercent) * 2
      : Math.max(0, moisturePercent - 13) * 3;
  const gradePenalty = sizeGrade === "A" ? 0 : sizeGrade === "B" ? 6 : 14;
  const defectPenalty = defectPercent * 4;
  const rawScore = 100 - moisturePenalty - gradePenalty - defectPenalty;

  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

export function getQualityDecision(score: number): QualityDecision {
  if (score >= 90) {
    return "priority";
  }

  if (score >= 82) {
    return "passed";
  }

  return "held";
}

export const previewQualityScore = query({
  args: {
    moisturePercent: v.number(),
    sizeGrade: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    defectPercent: v.number(),
  },
  handler: async (_ctx, args) => {
    const qualityScore = calculateQualityScore(args);

    return {
      qualityScore,
      decision: getQualityDecision(qualityScore),
    };
  },
});

export const saveQualityCheck = mutation({
  args: {
    depositId: v.id("deposits"),
    moisturePercent: v.number(),
    sizeGrade: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    defectPercent: v.number(),
    inspectorName: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) {
      throw new Error("Setoran tidak ditemukan.");
    }

    if (args.moisturePercent < 0 || args.defectPercent < 0) {
      throw new Error("Parameter QC tidak boleh bernilai negatif.");
    }

    const qualityScore = calculateQualityScore(args);
    const decision = getQualityDecision(qualityScore);
    const checkedAt = Date.now();
    const qcData = {
      moisturePercent: args.moisturePercent,
      sizeGrade: args.sizeGrade,
      defectPercent: args.defectPercent,
      notes: args.notes,
    };
    const qualityCheckId = await ctx.db.insert("qualityChecks", {
      koperasiId: deposit.koperasiId,
      depositId: args.depositId,
      moisturePercent: args.moisturePercent,
      sizeGrade: args.sizeGrade,
      defectPercent: args.defectPercent,
      qualityScore,
      decision,
      inspectorName: args.inspectorName,
      notes: args.notes,
      checkedAt,
    });

    await ctx.db.patch(args.depositId, {
      qualityScore,
      qualityDecision: decision,
      qualityCheckedAt: checkedAt,
      qcData,
      status: decision === "held" ? "rejected" : "quality_checked",
    });

    return {
      qualityCheckId,
      qualityScore,
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
          moisturePercent: check.moisturePercent,
          sizeGrade: check.sizeGrade,
          defectPercent: check.defectPercent,
          qualityScore: check.qualityScore,
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
            moisturePercent: check.moisturePercent,
            sizeGrade: check.sizeGrade,
            defectPercent: check.defectPercent,
            qualityScore: check.qualityScore,
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
      moisturePercent: check.moisturePercent,
      sizeGrade: check.sizeGrade,
      defectPercent: check.defectPercent,
      qualityScore: check.qualityScore,
      decision: check.decision,
      inspectorName: check.inspectorName,
      notes: check.notes ?? null,
      checkedAt: check.checkedAt,
    };
  },
});
