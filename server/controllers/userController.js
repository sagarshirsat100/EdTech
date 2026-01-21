import User from "../models/User.js"
import Course from "../models/Course.js";
import Purchase from '../models/Purchase.js'
import Stripe from "stripe"

export const getUserData = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



export const userEnrolledCourses = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    const enrolledCourses = await Course.find({
      enrolledStudents: clerkUserId,
      isPublished: true,
    }).select("-courseContent");

    res.json({ success: true, enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;

    // Clerk user ID (string)
    const clerkUserId = req.auth.userId;

    // ✅ Find user by clerkId (NOT by _id)
    const userData = await User.findOne({ clerkId: clerkUserId });

    // Course _id is MongoDB ObjectId → findById is correct
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data not found" });
    }

    // Calculate final amount
    const amount =
      courseData.coursePrice -
      (courseData.discount * courseData.coursePrice) / 100;

    // Store purchase using Clerk ID for user
    const purchaseData = {
      courseId: courseData._id,
      userId: clerkUserId,
      amount: Number(amount.toFixed(2)),
    };

    const newPurchase = await Purchase.create(purchaseData);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: courseData.courseTitle,
            },
            unit_amount: Math.round(newPurchase.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
