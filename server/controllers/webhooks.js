import { Webhook } from "svix";
import User from "../models/User.js";
import connectDB from "../configs/mongodb.js";

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
