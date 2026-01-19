import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";

const MyEnrollments = () => {
  const { enrolledCourses, calculateCourseDuration, navigate } =
    useContext(AppContext);

  // Temporary mock progress (later replace with backend data)
  const [progressArray] = useState([
    { lecturesCompleted: 4, totalLectures: 10 },
    { lecturesCompleted: 7, totalLectures: 15 },
    { lecturesCompleted: 2, totalLectures: 8 },
    { lecturesCompleted: 4, totalLectures: 10 },
    { lecturesCompleted: 7, totalLectures: 15 },
    { lecturesCompleted: 2, totalLectures: 8 },
  ]);

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="md:px-36 px-8 pt-10">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <p className="mt-6 text-gray-500">No enrolled courses yet.</p>
      </div>
    );
  }

  return (
    <div className="md:px-36 px-8 pt-10">
      <h1 className="text-2xl font-semibold">My Enrollments</h1>

      <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
          <tr>
            <th className="px-4 py-3 font-semibold truncate">Course</th>
            <th className="px-4 py-3 font-semibold truncate">Duration</th>
            <th className="px-4 py-3 font-semibold truncate">Completed</th>
            <th className="px-4 py-3 font-semibold truncate">Status</th>
          </tr>
        </thead>

        <tbody className="text-gray-700">
          {enrolledCourses.map((course, index) => {
            const progress = progressArray[index];
            const isCompleted =
              progress &&
              progress.lecturesCompleted === progress.totalLectures;

            return (
              <tr
                className="border-b border-gray-500/20"
                key={course._id}
              >
                {/* Course Info */}
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-14 sm:w-24 md:w-28 rounded"
                  />

                  <div className="flex-1">
                    <p className="mb-1 max-sm:text-sm">
                      {course.courseTitle}
                    </p>

                    <Line
                      strokeWidth={2}
                      percent={
                        progress
                          ? (progress.lecturesCompleted * 100) /
                            progress.totalLectures
                          : 0
                      }
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>

                {/* Duration */}
                <td className="px-4 py-3 max-sm:hidden">
                  {calculateCourseDuration(course)}
                </td>

                {/* Completed */}
                <td className="px-4 py-3 max-sm:hidden">
                  {progress
                    ? `${progress.lecturesCompleted} / ${progress.totalLectures}`
                    : "0 / 0"}{" "}
                  <span>Lectures</span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 max-sm:text-right">
                  <button
                    onClick={() => navigate("/player/" + course._id)}
                    className={`px-3 sm:px-5 py-1.5 sm:py-2 max-sm:text-xs text-white rounded
                      ${
                        isCompleted
                          ? "bg-green-600"
                          : "bg-blue-600"
                      }`}
                  >
                    {isCompleted ? "Completed" : "On Going"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer/>
    </div>
  );
};

export default MyEnrollments;
