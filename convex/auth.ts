import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";


type UserRole = "admin" | "cooperative" | "buyer" | "member";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  token: string,
  allowedRoles: UserRole[],
) {
  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session || session.revokedAt) {
    throw new Error("Session tidak valid.");
  }

  const user = await ctx.db.get(session.userId);
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Akses ditolak.");
  }

  return user;
}

export const registerUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("cooperative"), v.literal("buyer")),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = normalizeEmail(args.email);

    if (name.length < 3) {
      throw new Error("Nama minimal 3 karakter.");
    }

    if (!emailPattern.test(email)) {
      throw new Error("Email harus valid.");
    }

    if (args.password.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      throw new Error("Email sudah terdaftar.");
    }

    const userId = await ctx.db.insert("users", {
      name,
      email,
      role: args.role,
      passwordHash: await hashPassword(args.password),
      joinedAt: Date.now(),
    });

    if (args.role === "cooperative") {
      await ctx.db.insert("koperasiProfiles", {
        adminId: userId,
        name,
        location: "Jawa Barat",
        createdAt: Date.now(),
      });
    }

    return userId;
  },
});

export const loginUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);

    if (!emailPattern.test(email)) {
      throw new Error("Email atau password tidak valid.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user || user.passwordHash !== (await hashPassword(args.password))) {
      throw new Error("Email atau password tidak valid.");
    }

    const token = crypto.randomUUID();
    await ctx.db.insert("authSessions", {
      userId: user._id,
      token,
      createdAt: Date.now(),
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
});

export const logoutUser = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        revokedAt: Date.now(),
      });
    }
  },
});

export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    const token = crypto.randomUUID();
    await ctx.db.insert("passwordResetTokens", {
      userId: user._id,
      token,
      createdAt: Date.now(),
    });
    return token;
  },
});

export const resetPasswordWithToken = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.newPassword.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken || resetToken.usedAt) {
      throw new Error("Token reset tidak valid.");
    }

    await ctx.db.patch(resetToken.userId, {
      passwordHash: await hashPassword(args.newPassword),
      updatedAt: Date.now(),
    });
    await ctx.db.patch(resetToken._id, {
      usedAt: Date.now(),
    });
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    await ctx.db.patch(args.userId, {
      name: args.name,
      email: args.email,
      updatedAt: Date.now(),
    });
  },
});

export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.passwordHash !== (await hashPassword(args.oldPassword))) {
      throw new Error("Password lama tidak valid.");
    }

    if (args.newPassword.length < 6) {
      throw new Error("Password baru minimal 6 karakter.");
    }

    await ctx.db.patch(args.userId, {
      passwordHash: await hashPassword(args.newPassword),
      updatedAt: Date.now(),
    });
  },
});

export const getUserByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.revokedAt) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});
