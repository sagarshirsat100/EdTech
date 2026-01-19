import { Webhook } from "svix";
import User from "../models/User.js";
import connectDB from "../configs/mongodb.js";

export const clerkWebhooks = async (req, res) => {
  try {
    console.log("🚀 Clerk webhook hit");

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // ✅ Verify webhook using RAW body
    const evt = wh.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = evt;

    // ✅ Ensure DB connection (important for Vercel)
    await connectDB();

    switch (type) {
      case "user.created": {
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            clerkId: data.id,
            email: data.email_addresses[0]?.email_address,
            name: `${data.first_name || ""} ${data.last_name || ""}`,
            imageUrl: data.image_url,
          },
          { upsert: true, new: true }
        );
        break;
      }

      case "user.updated": {
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            email: data.email_addresses[0]?.email_address,
            name: `${data.first_name || ""} ${data.last_name || ""}`,
            imageUrl: data.image_url,
          }
        );
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id });
        break;
      }

      default:
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
