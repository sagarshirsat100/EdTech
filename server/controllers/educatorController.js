import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

/* =========================
   UPDATE ROLE
========================= */
export const updateRoleToEducator = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role: "educator" },
    });

    res.json({ success: true, message: "You can publish a course" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   ADD COURSE
========================= */
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId; // Clerk ID

    if (!imageFile) {
      return res.json({ success: false, message: "Thumbnail not attached" });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    const newCourse = await Course.create(parsedCourseData);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.json({ success: true, message: "Course Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   GET EDUCATOR COURSES
========================= */
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId; // Clerk ID
    const courses = await Course.find({ educator });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   DASHBOARD DATA
========================= */
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;

    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    const enrolledStudentsData = [];

    for (const course of courses) {
      const students = await User.find(
        { clerkId: { $in: course.enrolledStudents } },
        "name imageUrl"
      );

      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   ENROLLED STUDENTS LIST
========================= */
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;

    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const enrolledStudents = [];

    for (const purchase of purchases) {
      const student = await User.findOne(
        { clerkId: purchase.userId },
        "name imageUrl"
      );

      const course = await Course.findById(
        purchase.courseId,
        "courseTitle"
      );

      if (student && course) {
        enrolledStudents.push({
          student,
          courseTitle: course.courseTitle,
          purchaseDate: purchase.createdAt,
        });
      }
    }

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
