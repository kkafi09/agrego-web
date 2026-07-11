import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("cooperative"),
      v.literal("buyer"),
    ),
    passwordHash: v.string(),
    joinedAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),
  authSessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),
  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),
  koperasiProfiles: defineTable({
    adminId: v.id("users"),
    name: v.string(),
    location: v.string(),
    address: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    leaderName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_admin", ["adminId"]),
  members: defineTable({
    koperasiId: v.id("koperasiProfiles"),
    name: v.string(),
    phone: v.string(),
    village: v.optional(v.string()),
    primaryCommodityId: v.optional(v.id("commodities")),
    status: v.optional(
      v.union(v.literal("active"), v.literal("needs_verification")),
    ),
    joinedAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_koperasi", ["koperasiId"])
    .index("by_phone", ["phone"]),
  commodities: defineTable({
    koperasiId: v.optional(v.id("koperasiProfiles")),
    commodityKey: v.optional(v.string()),
    createdByKoperasiId: v.optional(v.id("koperasiProfiles")),
    name: v.string(),
    unit: v.string(),
    qualityParameters: v.array(v.string()),
    qualityRules: v.optional(
      v.array(
        v.object({
          name: v.string(),
          minimum: v.optional(v.number()),
          maximum: v.optional(v.number()),
          weight: v.number(),
        }),
      ),
    ),
    minimumQualityScore: v.number(),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_status", ["status"])
    .index("by_koperasi", ["koperasiId"])
    .index("by_commodity_key", ["commodityKey"])
    .index("by_created_by_koperasi", ["createdByKoperasiId"]),
  koperasiCommodities: defineTable({
    koperasiId: v.id("koperasiProfiles"),
    commodityId: v.id("commodities"),
    status: v.union(v.literal("active"), v.literal("inactive")),
    minimumQualityScore: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_koperasi", ["koperasiId"])
    .index("by_commodity", ["commodityId"])
    .index("by_koperasi_and_commodity", ["koperasiId", "commodityId"]),
  contracts: defineTable({
    buyerId: v.id("users"),
    koperasiId: v.optional(v.id("koperasiProfiles")),
    commodityId: v.id("commodities"),
    commodityKey: v.optional(v.string()),
    contractNumber: v.string(),
    title: v.optional(v.string()),
    targetVolumeKg: v.number(),
    fulfilledVolumeKg: v.optional(v.number()),
    fulfillmentPercent: v.optional(v.number()),
    minimumQualityScore: v.optional(v.number()),
    minimumQualityGrade: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"))),
    pricePerKg: v.number(),
    deadlineAt: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_koperasi", ["koperasiId"])
    .index("by_commodity", ["commodityId"])
    .index("by_status", ["status"])
    .index("by_koperasi_and_status", ["koperasiId", "status"]),
  deposits: defineTable({
    koperasiId: v.id("koperasiProfiles"),
    memberId: v.id("members"),
    commodityId: v.id("commodities"),
    depositNumber: v.string(),
    weightKg: v.number(),
    submittedAt: v.number(),
    origin: v.optional(v.string()),
    collectorName: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("recorded"),
      v.literal("quality_checked"),
      v.literal("allocated"),
      v.literal("rejected"),
    ),
    qualityGrade: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"))),
    qualityScore: v.optional(v.number()),
    qualityDecision: v.optional(
      v.union(
        v.literal("priority"),
        v.literal("passed"),
        v.literal("held"),
      ),
    ),
    qualityCheckedAt: v.optional(v.number()),
    qcData: v.optional(
      v.object({
        moisturePercent: v.optional(v.number()),
        sizeGrade: v.optional(v.string()),
        qualityGrade: v.optional(v.string()),
        defectPercent: v.number(),
        notes: v.optional(v.string()),
      }),
    ),
  })
    .index("by_koperasi", ["koperasiId"])
    .index("by_commodity", ["commodityId"])
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"])
    .index("by_koperasi_and_commodity", ["koperasiId", "commodityId"]),
  supplyPools: defineTable({
    koperasiId: v.id("koperasiProfiles"),
    contractId: v.id("contracts"),
    depositId: v.id("deposits"),
    allocatedWeightKg: v.number(),
    qualityScoreSnapshot: v.optional(v.number()),
    qualityGradeSnapshot: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"))),
    status: v.union(
      v.literal("allocated"),
      v.literal("released"),
      v.literal("settled"),
    ),
    notes: v.optional(v.string()),
    allocatedAt: v.number(),
  })
    .index("by_koperasi", ["koperasiId"])
    .index("by_contract", ["contractId"])
    .index("by_deposit", ["depositId"]),
  qualityChecks: defineTable({
    koperasiId: v.id("koperasiProfiles"),
    depositId: v.id("deposits"),
    moisturePercent: v.optional(v.number()),
    sizeGrade: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"))),
    qualityGrade: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"))),
    defectPercent: v.number(),
    qualityScore: v.optional(v.number()),
    decision: v.union(
      v.literal("priority"),
      v.literal("passed"),
      v.literal("held"),
    ),
    inspectorName: v.string(),
    notes: v.optional(v.string()),
    checkedAt: v.number(),
  })
    .index("by_koperasi", ["koperasiId"])
    .index("by_deposit", ["depositId"])
    .index("by_decision", ["decision"])
    .index("by_checked_at", ["checkedAt"]),
  profitShares: defineTable({
    contractId: v.id("contracts"),
    poolId: v.id("supplyPools"),
    memberId: v.id("members"),
    contributedWeightKg: v.number(),
    qualityScore: v.number(),
    amountEarned: v.number(),
    calculatedAt: v.number(),
  })
    .index("by_contract", ["contractId"])
    .index("by_member", ["memberId"])
    .index("by_pool", ["poolId"]),
  contractNotifications: defineTable({
    koperasiId: v.id("koperasiProfiles"),
    contractId: v.id("contracts"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("new_contract"),
      v.literal("deadline_warning"),
      v.literal("pool_update"),
    ),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_koperasi", ["koperasiId"])
    .index("by_contract", ["contractId"]),
});
