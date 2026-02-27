import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import img1 from "../assets/residentialcleaning.webp";
import img2 from "../assets/commercialcleaning.jpg";
import img3 from "../assets/mobilecarwash.jpg";
import img4 from "../assets/packersandmovers.webp";
import logo from "../assets/logo.png";
import Footer from "../components/Footer";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Add floating and slide-in animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes slideInFromLeft {
        0% {
          opacity: 0;
          transform: translateX(-100px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInFromRight {
        0% {
          opacity: 0;
          transform: translateX(100px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes fadeInUp {
        0% {
          opacity: 0;
          transform: translateY(30px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Check if user is logged in using the new localStorage structure
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("user_name");
    const userEmail = localStorage.getItem("user_email");
    
    if (userId && userName && userEmail) {
      setUser({
        id: userId,
        name: userName,
        email: userEmail
      });
    }

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear all user data
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_email");
        localStorage.removeItem("rememberMe");
        
        setUser(null);
        setDropdownOpen(false);
        
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been logged out successfully",
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">

      {/* Top Banner - Beautiful Gradient */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 text-white text-center py-3 text-sm font-medium shadow-lg relative overflow-hidden animate-[fadeInUp_0.6s_ease-out]">
        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span className="text-lg">✨</span>
          Welcome to our cleaning services platform
          <span className="text-lg">✨</span>
        </div>
      </div>

      {/* Header Section - Modern Gradient Design */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-5 shadow-2xl animate-[fadeInUp_0.8s_ease-out]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Left Logo - With White Background */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-start items-center">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                <img
                  src={logo}
                  className="h-12 md:h-14 w-auto"
                  alt="Splash Shine Solution Logo"
                />
              </div>
            </div>

            {/* Center Title */}
            <div className="text-center w-full md:w-1/3">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-cyan-300 to-green-400 bg-clip-text text-transparent">
                Splash Shine Solution
              </h1>
              <p className="text-xs mt-1 text-blue-200 font-light">
                Professional Cleaning & Moving Solutions
              </p>
            </div>

            {/* Right Login/User Section */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-end">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-white hover:text-cyan-300 transition-colors duration-300 font-semibold cursor-pointer bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center gap-2 mt-1"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a 
                  href="/login" 
                  className="text-white hover:text-cyan-300 transition-colors duration-300 font-semibold cursor-pointer flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Login</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Text Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 text-center animate-[fadeInUp_1s_ease-out]">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 bg-clip-text text-transparent">
          Experience Professional Cleaning
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Premium cleaning, car wash, and moving services delivered right to your doorstep
        </p>
      </div>

      {/* Services Section - Beautiful Cards */}
      <div id="services" className="py-10 px-5 md:px-20 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with Gradient Line */}
          <div className="flex items-center gap-6 mb-12 animate-[slideInFromLeft_1s_ease-out]">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 whitespace-nowrap">Our Services</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 rounded-full"></div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

            {/* Card 1 - Residential Cleaning */}
            <div className="group bg-white rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-blue-300 p-4 cursor-pointer transform hover:-translate-y-4 hover:rotate-1 transition-all duration-500 animate-[float_6s_ease-in-out_infinite,slideInFromLeft_1.2s_ease-out]">
              <div className="relative overflow-hidden rounded-xl mb-4 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <img 
                  src={img1} 
                  className="rounded-xl w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700" 
                  alt="Residential Cleaning" 
                />
                <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  Popular
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                Residential Cleaning
              </h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">Professional home cleaning services</p>
              <button
                onClick={() => navigate("/booking?type=residential")}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group/btn">
                <span className="relative z-10">Book Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Card 2 - Commercial Cleaning */}
            <div className="group bg-white rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-green-300 p-4 cursor-pointer transform hover:-translate-y-4 hover:-rotate-1 transition-all duration-500 animate-[float_6s_ease-in-out_infinite_0.5s,slideInFromRight_1.3s_ease-out]">
              <div className="relative overflow-hidden rounded-xl mb-4 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <img 
                  src={img2} 
                  className="rounded-xl w-full h-full object-cover group-hover:scale-125 group-hover:-rotate-2 transition-all duration-700" 
                  alt="Commercial Cleaning" 
                />
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  Business
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                Commercial Cleaning
              </h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">Complete business cleaning solutions</p>
              <button
                onClick={() => navigate("/booking?type=commercial")}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Book Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Card 3 - Mobile Car Wash */}
            <div className="group bg-white rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-blue-300 p-4 cursor-pointer transform hover:-translate-y-4 hover:rotate-1 transition-all duration-500 animate-[float_6s_ease-in-out_infinite_1s,slideInFromLeft_1.4s_ease-out]">
              <div className="relative overflow-hidden rounded-xl mb-4 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <img 
                  src={img3} 
                  className="rounded-xl w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700" 
                  alt="Mobile Car Wash" 
                />
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold z-20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  Mobile
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                Mobile Car Wash
              </h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">Premium car wash at your doorstep</p>
              <button
                onClick={() => navigate("/booking/mobile-car-wash")}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Book Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Card 4 - Packers & Movers */}
            <div className="group bg-white rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-teal-300 p-4 cursor-pointer transform hover:-translate-y-4 hover:-rotate-1 transition-all duration-500 animate-[float_6s_ease-in-out_infinite_1.5s,slideInFromRight_1.5s_ease-out]">
              <div className="relative overflow-hidden rounded-xl mb-4 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <img 
                  src={img4} 
                  className="rounded-xl w-full h-full object-cover group-hover:scale-125 group-hover:-rotate-2 transition-all duration-700" 
                  alt="Packers and Movers" 
                />
                <div className="absolute top-3 right-3 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  Trusted
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300">
                Packers & Movers
              </h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">Safe and reliable moving services</p>
              <button 
                onClick={() => navigate("/packers-movers")}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group/btn">
                <span className="relative z-10">Book Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;