import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";

// React Icons
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://splash-shine-api.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log("Login response:", data); // Debug log

      if (response.ok) {
        // ✅ STORE USER DATA AS A SINGLE OBJECT
        const userData = {
          user_id: data.user_id,
          name: data.name,
          email: data.email
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Also store individual fields for backward compatibility
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.name);
        localStorage.setItem("user_email", data.email);
        
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${data.name}!`,
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          // Check if user was redirected from booking page
          const returnTo = location.state?.returnTo;
          if (returnTo) {
            navigate(returnTo);
          } else {
            navigate("/");
          }
        });
      } else {
        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.detail || "Invalid email or password",
          showConfirmButton: false,
          timer: 1500
        });
        setError(data.detail || "Invalid email or password");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Unable to connect to server. Please try again.",
        showConfirmButton: false,
        timer: 1500
      });
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <img
                  src={logo}
                  className="h-16 w-auto"
                  alt="Splash Shine Solution Logo"
                />
              </div>
              <div>
                <h4 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome Back!
                </h4>
                <p className="text-sm text-gray-600">
                  Login to continue
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all 
                  duration-300 outline-none"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all 
                  duration-300 outline-none"
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg 
              hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg disabled:from-gray-400 
              disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Signup Link */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link 
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors" 
              to="/signup"
            >
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}