import { Webhook } from "svix";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import connectDB from "../configs/mongodb.js";
import Stripe from 'stripe'

export const clerkWebhooks = async (req, res) => {
  try {
    console.log("STEP 1: Webhook handler entered");

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // ✅ VERIFY USING RAW BODY (DO NOT STRINGIFY)
    const evt = wh.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = evt;
    console.log("STEP 3: Event type =", type);

    // ✅ CONNECT DB INSIDE HANDLER (VERCEL REQUIRED)
    await connectDB();
    console.log("STEP 4: DB connected");

    if (type === "user.created" || type === "user.updated") {
      console.log("STEP 5: About to write user", data.id);

      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          imageUrl: data.image_url,
        },
        { upsert: true }
      );

      console.log("STEP 6: User write successful");
    }

    if (type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: data.id });
      console.log("STEP 6: User deleted");
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    response.status(400).send(`Webhook error:${err.message}`);
  }
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId})
      const {purchaseId} = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId.toString())

      courseData.enrolledStudents.push(userData)
      await courseData.save()
      userData.enrolledCourses.push(courseData._id)
      await userData.save();
      purchaseData.status = 'completed'
      await purchaseData.save();

      break; 
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId})
      const {purchaseId} = session.data[0].metadata;
      
      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = 'failed'
      await purchaseData.save();
      break;
    }
    default:
      console.log("Unhandled event type ${event.type}");
  }
  response.json({ received: true });
};