import React from "react"
import { Outlet } from "react-router-dom";
import Navbar from "../../components/educator/Navbar.jsx"
import Sidebar from "./Sidebar.jsx";
import Footer from '../educator/Footer.jsx'

const Educator = () => {
  return (
    <div className="text-default min-h-screen bg-white">
      <Navbar/>

      <div className="flex">  
        <Sidebar></Sidebar>
        <div className="flex-1">
          <Outlet/>
        </div>
      </div>
      <Footer></Footer>
    </div>
  )
};

export default Educator;
