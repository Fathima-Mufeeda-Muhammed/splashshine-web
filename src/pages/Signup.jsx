import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";

// React Icons
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone } from "react-icons/fi";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.termsAccepted) {
      setError("Please accept the Terms & Conditions");
      return;
    }

    if (formData.mobile.length < 10) {
      setError("Mobile number must be at least 10 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://splash-shine-api.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ STORE USER DATA AS A SINGLE OBJECT
        const userData = {
          user_id: data.user_id,
          name: formData.name,
          email: formData.email
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Also store individual fields for backward compatibility
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", formData.name);
        localStorage.setItem("user_email", formData.email);

        // Show success alert with SweetAlert2
        await Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: `Welcome, ${formData.name}!`,
          showConfirmButton: false,
          timer: 1500
        });
        
        // Check if user was redirected from booking page
        const returnTo = location.state?.returnTo;
        if (returnTo) {
          navigate(returnTo);
        } else {
          navigate("/");
        }
      } else {
        setError(data.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Signup Card */}
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
                <h4 className="text-3xl font-bold text-indigo-900">
                  Create Account
                </h4>
                <p className="text-lg text-gray-300">
                  Sign up to get started
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name Field */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all 
                  duration-300 outline-none"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

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
                  focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all 
                  duration-300 outline-none"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Mobile Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all 
                  duration-300 outline-none"
                  placeholder="Enter your mobile number"
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
                  focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all 
                  duration-300 outline-none"
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all 
                  duration-300 outline-none"
                  placeholder="Confirm your password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 text-sm">
              <input 
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-4 h-4 mt-1 rounded border-gray-300 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline">
                  Terms & Conditions
                </a>
                {" "}and{" "}
                <a href="#" className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Signup Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md 
              hover:bg-blue-700 transition-all duration-300 text-lg disabled:bg-gray-400 
              disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link 
              className="text-cyan-600 font-bold hover:text-cyan-700 hover:underline transition-colors" 
              to="/login"
            >
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}