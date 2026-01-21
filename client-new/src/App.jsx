import React from "react"
import { Routes, Route, useMatch } from "react-router-dom";
import Home from "./pages/student/Home";
import CoursesList from "./pages/student/CoursesList.jsx";
import MyEnrollments from "./pages/student/MyEnrollments.jsx";
import CoursesDetails from "./pages/student/CoursesDetails.jsx";
import Player from './pages/student/Player.jsx';
import Loading from "./components/Loading.jsx";
import Educator from "./pages/educator/Educator.jsx";
import Dashboard from "./pages/educator/Dashboard.jsx";
import AddCourse from "./pages/educator/AddCourse.jsx";
import MyCourses from "./pages/educator/MyCourses.jsx";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled.jsx";
import Navbar from "./components/student/Navbar.jsx";
import "quill/dist/quill.snow.css"
import {ToastContainer } from 'react-toastify'


const App = () => {
  const isEducatorRoute = useMatch('/educator/*');

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer/>
      {!isEducatorRoute && <Navbar/> }
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/course-list" element={<CoursesList/>}/>
        <Route path="/course-list/:input" element={<CoursesList/>}/>
        <Route path="/course/:id" element={<CoursesDetails/>}/>
        <Route path="/my-enrollments" element={<MyEnrollments/>}/>
        <Route path="/player/:courseId" element={<Player/>}/>
        <Route path="/loading/:path" element={<Loading/>}/>
        <Route path="/educator" element={<Educator/>}>
          <Route path="/educator" element={<Dashboard/>}/>
          <Route path="add-course" element={<AddCourse/>}/>
          <Route path="my-courses" element={<MyCourses/>}/>
          <Route path="student-enrolled" element={<StudentsEnrolled/>}/>
        </Route>
      </Routes>
    </div>
  )
};

export default App;