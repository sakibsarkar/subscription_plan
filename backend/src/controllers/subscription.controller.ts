import { stripe } from "../app";
import catchAsyncError from "../middlewares/catchAsyncErrors";
import Plan from "../models/plan.model";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";
import sendResponse from "../utils/sendResponse";

export const createSubscription = catchAsyncError(async (req, res) => {
  const { userId, planId, email,paymentMethodId } = req.body;

  const user = await User.findById(userId);
  const plan = await Plan.findById(planId);

  if (!user || !plan) {
    console.log({ user, plan });

    return res.status(404).json({ message: "User or Plan not found" });
  }
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }
  const subscription = await stripe.subscriptions.create({
    customer: user.stripeCustomerId,
    items: [{ price: plan.stripePriceId as string }],
  });

  // Create a new Subscription document
  const newSubscription = new Subscription({
    user: user._id,
    plan: plan._id,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });

  await newSubscription.save();

  // Update the user's subscription reference
  user.subscription = newSubscription._id;
  await user.save();

  sendResponse(res, {
    message: "Subscription created successfully",
    data: newSubscription,
    success: true,
  });
});
