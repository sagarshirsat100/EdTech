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

export const updateUserCourseProgress = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    let progressData = await CourseProgress.findOne({
      userId: clerkUserId,
      courseId,
    });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture Already Completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId: clerkUserId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { courseId } = req.body;

    const progressData = await CourseProgress.findOne({
      userId: clerkUserId,
      courseId,
    });

    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addUserRating = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!courseId || !clerkUserId || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Invalid Details" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found." });
    }

    // user must be enrolled (enrolledStudents stores Clerk IDs)
    if (!course.enrolledStudents.includes(clerkUserId)) {
      return res.json({
        success: false,
        message: "User has not purchased this course.",
      });
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId === clerkUserId
    );

    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId: clerkUserId, rating });
    }

    await course.save();
    res.json({ success: true, message: "Rating added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

