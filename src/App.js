import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import MobileCarWashPage from "./pages/MobileCarWashPage";
import PackersMoversPage from "./pages/PackersMoversPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Admin pages
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import UsersList from "./pages/UsersList";
import BookingsList from "./pages/BookingsList";
import PaymentsList from "./pages/PaymentsList";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ----------- User Routes ----------- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/mobile-car-wash" element={<MobileCarWashPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/packers-movers" element={<PackersMoversPage />} />

        {/* ----------- Admin Routes ----------- */}

        {/* Redirect /admin → /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/bookings" element={<BookingsList />} />
        <Route path="/admin/payments" element={<PaymentsList />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
