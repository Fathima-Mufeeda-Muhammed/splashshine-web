import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("admin_name") || "Admin";
    setAdminName(name);
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, bookingsRes, paymentsRes] = await Promise.all([
        axios.get("http://localhost:8000/admin/users"),
        axios.get("http://localhost:8000/admin/bookings"),
        axios.get("http://localhost:8000/admin/payments")
      ]);

      const users = usersRes.data.users || [];
      const bookings = bookingsRes.data.bookings || [];
      const payments = paymentsRes.data.payments || [];

      // Calculate total revenue from approved payments
      const totalRevenue = payments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Count pending payments
      const pendingPayments = payments.filter(p => p.status === 'pending').length;

      setStats({
        totalUsers: users.length,
        totalBookings: bookings.length,
        totalRevenue: totalRevenue.toFixed(2),
        pendingPayments
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");
    navigate("/admin/login");
  };

  const cards = [
    {
      title: "Registered Users",
      description: "Manage all registered customers",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: "/admin/users",
      gradient: "from-blue-600 to-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Bookings",
      description: "Track and manage all bookings",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      link: "/admin/bookings",
      gradient: "from-purple-600 to-purple-700",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Payments",
      description: "Monitor and verify payments",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      link: "/admin/payments",
      gradient: "from-emerald-600 to-emerald-700",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={logo} 
              alt="Splash Shine" 
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Splash Shine
              </span>
              <p className="text-xs text-gray-500 font-medium">Admin Dashboard</p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold text-lg">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-white hidden sm:block">{adminName}</span>
              <svg className={`w-4 h-4 text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-xl border border-gray-100 p-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 font-medium flex items-center space-x-2 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {adminName}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-10">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl ${card.iconBg} ${card.iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {card.description}
                </p>

                {/* Action Button */}
                <div className="flex items-center space-x-2 text-sm font-semibold">
                  <span className={`bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    View All
                  </span>
                  <svg className={`w-4 h-4 ${card.iconColor} group-hover:translate-x-1 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Decorative gradient overlay */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 rounded-full blur-3xl transition-opacity duration-500`}></div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Stats Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {loading ? "..." : stats.totalUsers}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Users</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                {loading ? "..." : stats.totalBookings}
              </div>
              <div className="text-sm text-gray-600 font-medium">Active Bookings</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-2">
                {loading ? "..." : `₹${stats.totalRevenue}`}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;