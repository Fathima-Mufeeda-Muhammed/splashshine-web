import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // Store OTP from backend
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP request (get OTP from backend)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch("https://splash-shine-api.onrender.com/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtp(data.otp); // Store OTP from backend
        setStep(2);
        Swal.fire({
          icon: "success",
          title: "OTP Generated!",
          html: `Your OTP is: <strong style="font-size:24px; color:#2563eb;">${data.otp}</strong><br/><small>Enter this OTP in the next step</small>`,
          confirmButtonColor: "#10b981",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.detail || "Email not found. Please check and try again.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Unable to connect to server. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP (client-side check)
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpInput) {
      Swal.fire({
        icon: "warning",
        title: "Enter OTP",
        text: "Please enter the 6-digit OTP.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    if (otpInput.trim() === String(otp).trim()) {
      setStep(3);
      Swal.fire({
        icon: "success",
        title: "OTP Verified!",
        text: "Please enter your new password.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "The OTP you entered is incorrect. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 8 characters.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Don't Match",
        text: "Please make sure both passwords are the same.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://splash-shine-api.onrender.com/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpInput, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Password Reset!",
          text: "Your password has been updated. Please login with your new password.",
          confirmButtonColor: "#10b981",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text: data.detail || "Something went wrong. Please try again.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Unable to connect to server. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">

          {/* Logo & Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <img src={logo} className="h-14 w-auto" alt="Splash Shine Logo" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Forgot Password
              </h2>
              <p className="text-sm text-gray-500">Reset your account password</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center mb-8">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${step > i + 1 ? "bg-green-500 text-white" :
                      step === i + 1 ? "bg-blue-600 text-white" :
                      "bg-gray-200 text-gray-400"}`}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${step === i + 1 ? "text-blue-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Registered Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll generate a 6-digit OTP for password reset.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating OTP...
                  </span>
                ) : "Generate OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                📧 OTP generated for <strong>{email}</strong>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full text-center text-2xl font-bold tracking-widest py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                  placeholder="------"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Check the previous popup for your OTP
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtpInput(""); setOtp(""); }}
                className="w-full py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
              >
                <FiArrowLeft /> Change Email
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                    placeholder="Re-enter new password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting...
                  </span>
                ) : "Reset Password"}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 font-semibold hover:underline text-sm flex items-center justify-center gap-1">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}