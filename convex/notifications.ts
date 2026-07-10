import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listContractNotifications = query({
  args: {
    koperasiId: v.id("koperasiProfiles"),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("contractNotifications")
      .withIndex("by_koperasi", (q) => q.eq("koperasiId", args.koperasiId))
      .collect();

    const filtered = args.unreadOnly
      ? notifications.filter((notification) => !notification.readAt)
      : notifications;

    return Promise.all(
      filtered
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(async (notification) => {
          const contract = await ctx.db.get(notification.contractId);
          const commodity = contract
            ? await ctx.db.get(contract.commodityId)
            : null;

          return {
            id: notification._id,
            contractId: notification.contractId,
            contractNumber: contract?.contractNumber ?? null,
            commodityName: commodity?.name ?? null,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: Boolean(notification.readAt),
            createdAt: notification.createdAt,
          };
        }),
    );
  },
});

export const createContractNotification = mutation({
  args: {
    contractId: v.id("contracts"),
    title: v.string(),
    message: v.string(),
    type: v.optional(
      v.union(
        v.literal("new_contract"),
        v.literal("deadline_warning"),
        v.literal("pool_update"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      throw new Error("Kontrak tidak ditemukan.");
    }

    if (!contract.koperasiId) {
      return null;
    }

    return ctx.db.insert("contractNotifications", {
      koperasiId: contract.koperasiId,
      contractId: args.contractId,
      title: args.title,
      message: args.message,
      type: args.type ?? "new_contract",
      createdAt: Date.now(),
    });
  },
});

export const markContractNotificationRead = mutation({
  args: {
    notificationId: v.id("contractNotifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    });
  },
});
