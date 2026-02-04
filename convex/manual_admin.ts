import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const grantBetaAccess = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            return { success: false, message: "User not found" };
        }

        await ctx.db.patch(user._id, {
            subscriptionTier: "starter",
            analysesLimit: 20,
            analysesUsed: 0,
            updatedAt: Date.now(),
        });

        return { success: true, message: `Granted beta access to ${args.email}` };
    },
});
