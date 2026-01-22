import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import Youtube from "react-youtube";
import { toast } from "react-toastify";
import axios from "axios";

const CoursesDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);

  const {
    allCourses,
    currency,
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    backendUrl,
    userData,
    getToken
  } = useContext(AppContext);

  const fetchCourseData = async () => {
    try {
      const {data} = await axios.get(backendUrl + "/api/course/" + id)
      if(data.success) {
        setCourseData(data.courseData)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
        toast.error(error.message)
    }
  }

  const enrollCourse = async () => {
  try {
    console.log(userData)
    if (!userData) {
      return toast.warn("Login to enroll");
    }

    if (isAlreadyEnrolled) {
      return toast.warn("Already enrolled");
    }

    const token = await getToken();

    const { data } = await axios.post(
      backendUrl + "/api/user/purchase",
      { courseId: courseData._id }, // ✅ BODY
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ HEADERS
        },
      }
    );

    if (data.success) {
      window.location.replace(data.session_url);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};


  useEffect(()=> {
    fetchCourseData();
  }, []);

  useEffect(()=>{
    if(userData && courseData) {
      setIsAlreadyEnrolled(userData.enrollCourses?.includes(courseData._id))
    }
  },[userData, courseData]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!courseData) return <Loading />;

  return (
    <>
      <div className="bg-gradient-to-b from-cyan-100/70">
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 text-gray-600">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                {courseData.courseTitle}
              </h1>

              <p
                className="pt-4 text-sm md:text-base"
                dangerouslySetInnerHTML={{
                  __html: courseData.courseDescription.slice(0, 200),
                }}
              />

              {/* Rating */}
              <div className="flex items-center gap-2 pt-3 text-sm">
                <p>{calculateRating(courseData)}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src={
                        i < Math.floor(calculateRating(courseData))
                          ? assets.star
                          : assets.star_blank
                      }
                      alt=""
                    />
                  ))}
                </div>
                <p>{courseData.courseRatings.length} ratings</p>
                <p>
                  {courseData.enrolledStudents.length}{" "}
                  {courseData.enrolledStudents.length === 1
                    ? "student"
                    : "students"}
                </p>
              </div>

              <p className="pt-2">
                Course by <span className="text-blue-600 underline">{courseData.educator.name}</span>
              </p>

              {/* Course Structure */}
              <div className="pt-8">
                <h2 className="text-xl font-semibold text-gray-800">
                  Course Structure
                </h2>

                <div className="pt-5">
                  {courseData.courseContent.map((chapter, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 bg-white mb-3 rounded"
                    >
                      <div
                        className="flex justify-between items-center px-4 py-3 cursor-pointer"
                        onClick={() => toggleSection(index)}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={assets.down_arrow_icon}
                            className={`transition-transform ${
                              openSections[index] ? "rotate-180" : ""
                            }`}
                            alt=""
                          />
                          <p className="font-medium">
                            {chapter.chapterTitle}
                          </p>
                        </div>
                      </div>

                      <p className="px-4 pb-2 text-sm">
                        {chapter.chapterContent.length} lectures ·{" "}
                        {calculateChapterTime(chapter)}
                      </p>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openSections[index]
                            ? "max-h-[1000px]"
                            : "max-h-0"
                        }`}
                      >
                        <ul className="border-t px-4 py-2 space-y-2 text-sm">
                          {chapter.chapterContent.map((lecture, i) => (
                            <li
                              key={i}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={assets.play_icon}
                                  className="w-4 h-4"
                                  alt=""
                                />
                                <p>{lecture.lectureTitle}</p>
                              </div>
                              <div className="flex gap-3 text-xs">
                                {lecture.isPreviewFree && (
                                  <span
                                    onClick={() =>
                                      setPlayerData({
                                        videoId: lecture.lectureUrl
                                          .split("/")
                                          .pop(),
                                      })
                                    }
                                    className="text-blue-500 cursor-pointer"
                                  >
                                    Preview
                                  </span>
                                )}
                                <span>
                                  {humanizeDuration(
                                    lecture.lectureDuration * 60 * 1000,
                                    { units: ["h", "m"] }
                                  )}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="py-16">
                <h3 className="text-xl font-semibold text-gray-800">
                  Course Description
                </h3>
                <div
                  className="pt-3 text-sm md:text-base"
                  dangerouslySetInnerHTML={{
                    __html: courseData.courseDescription,
                  }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full max-w-md bg-white rounded-lg shadow-custom-card overflow-hidden sticky top-24 z-20">
              {playerData ? (
                <Youtube
                  videoId={playerData.videoId}
                  opts={{ playerVars: { autoplay: 1 } }}
                  iframeClassName="w-full aspect-video"
                />
              ) : (
                <img
                  src={courseData.courseThumbnail}
                  alt=""
                  className="w-full aspect-video object-cover"
                />
              )}

              <div className="p-5">
                <div className="flex gap-3 items-center">
                  <p className="text-2xl md:text-3xl font-semibold">
                    {currency}
                    {(
                      courseData.coursePrice -
                      (courseData.discount * courseData.coursePrice) / 100
                    ).toFixed(2)}
                  </p>
                  <p className="line-through text-gray-500">
                    {currency}
                    {courseData.coursePrice}
                  </p>
                  <p className="text-gray-500">
                    {courseData.discount}% off
                  </p>
                </div>

                <div className="flex gap-4 text-sm text-gray-500 pt-4">
                  <div className="flex items-center gap-1">
                    <img src={assets.star} alt="" />
                    <p>{calculateRating(courseData)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={assets.time_clock_icon} alt="" />
                    <p>{calculateCourseDuration(courseData)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={assets.lesson_icon} alt="" />
                    <p>{calculateNoOfLectures(courseData)} lessons</p>
                  </div>
                </div>

                <button onClick={enrollCourse} className="mt-6 w-full py-3 bg-blue-600 text-white rounded font-medium">
                  Enroll Now
                </button>

                <ul className="pt-6 text-sm list-disc ml-4 text-gray-500">
                  <li>Lifetime access</li>
                  <li>Hands-on projects</li>
                  <li>Resources & source code</li>
                  <li>Quizzes & tests</li>
                  <li>Certificate</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CoursesDetails;
