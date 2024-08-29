import { RequestHandler } from "express";
import { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";

export const validSubscriptionHolder = (
  requiredPlan: string
): RequestHandler => {
  return async (req, res, next) => {
    const authId = (req.user as JwtPayload).id;

    try {
      const user = await User.findOne({ auth: authId }).populate({
        path: "subscription",
        populate: {
          path: "plan",
          model: "Plan",
        },
      });

      if (!user || !user.subscription) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const subscription: any = user.subscription;

      // Check if subscription is active and matches the required plan
      if (
        subscription.status === "active" &&
        subscription.plan._id === requiredPlan
      ) {
        return next();
      }

      return res
        .status(403)
        .json({ message: "Access denied. Upgrade your subscription." });
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
