import React from "react";
import Navbar from "../components/ui/NavBar.jsx";
import Footer from "../components/ui/Footer.jsx";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
