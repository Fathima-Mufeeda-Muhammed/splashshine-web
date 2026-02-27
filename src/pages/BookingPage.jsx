import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const SERVICES = [
  "Bedroom", "Toilet", "Dinning Hall", "Kitchen", "Kitchen Store",
  "Prayer Room", "T. V Room", "Office Room", "Balcony", "Dressing Room",
  "Staircase", "Hall", "Pest Control", "Floor Scrubbing & Polishing",
  "Roof Terrace", "Water Tank", "Septic Tank", "Interlock", "Gardening",
  "Grass cutting", "Tree Cutting", "Painting Master", "Painting Helper",
  "Cement Plasterer Master", "Cement Plasterer Helper",
  "Electrician and Plumbing Master", "Electrician and Plumber Helper",
  "Waterproofing Master", "Waterproofing Helper", "Dish Washing",
  "Curtain Laundry", "Carpenter"
];

const SQFT_OPTIONS = [
  { label: "0-50 sqft", value: "0-50", hours: 1 },
  { label: "50-100 sqft", value: "50-100", hours: 1.5 },
  { label: "100-150 sqft", value: "100-150", hours: 2 },
  { label: "150-200 sqft", value: "150-200", hours: 2.5 },
  { label: "200-250 sqft", value: "200-250", hours: 3 },
  { label: "250-300 sqft", value: "250-300", hours: 3.5 },
  { label: "300-350 sqft", value: "300-350", hours: 4 },
  { label: "350-400 sqft", value: "350-400", hours: 4.5 },
  { label: "400-450 sqft", value: "400-450", hours: 5 },
  { label: "450-500 sqft", value: "450-500", hours: 5.5 },
  { label: "500+ sqft", value: "500+", hours: 6 }
];

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const urlType = new URLSearchParams(location.search).get("type");

  const cleaningCategory =
    urlType === "commercial"
      ? "Commercial Cleaning Booking"
      : "Residential Cleaning Booking";

  const [cleaningType, setCleaningType] = useState("");
  const [price, setPrice] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceSqft, setServiceSqft] = useState({});
  const [loading, setLoading] = useState(false);
  const [typeOfService, setTypeOfService] = useState("");
  const [amcFrequency, setAmcFrequency] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    mobile: "",
    address: "",
    booking_date: "",
  });

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if user is logged in
  const isUserLoggedIn = () => {
    const user = localStorage.getItem("user");
    return user !== null;
  };

  // Auto calculate hours
  useEffect(() => {
    let hours = 0;
    Object.values(serviceSqft).forEach((sqftLabel) => {
      const option = SQFT_OPTIONS.find((opt) => opt.label === sqftLabel);
      if (option) hours += option.hours;
    });
    setTotalHours(hours);
  }, [serviceSqft]);

  // Calculate discount based on AMC frequency
  const getAmcDiscount = () => {
    if (typeOfService !== "amc") return 0;
    
    switch (amcFrequency) {
      case "12_months":
        return 500;
      case "6_months":
        return 250;
      case "3_months":
        return 100;
      default:
        return 0;
    }
  };

  const total = price * totalHours;
  const discount = getAmcDiscount();
  const finalAmount = total - discount;

  const handleServiceSelect = (service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        const newSqft = { ...serviceSqft };
        delete newSqft[service];
        setServiceSqft(newSqft);
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleSqftChange = (service, sqftLabel) => {
    setServiceSqft((prev) => ({
      ...prev,
      [service]: sqftLabel,
    }));
  };

  const selectCleaningType = (type) => {
    setCleaningType(type);
    setPrice(type === "normal" ? 600 : 1000);
  };

  const submitBooking = async () => {
    // Check if user is logged in first
    if (!isUserLoggedIn()) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login or register to make a booking",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Register",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#10b981",
      }).then((result) => {
        if (result.isConfirmed) {
          // Go to login page
          navigate("/login", { 
            state: { 
              returnTo: location.pathname + location.search,
              bookingData: {
                cleaningType,
                typeOfService,
                amcFrequency,
                selectedServices,
                serviceSqft,
                form
              }
            } 
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Go to register page
          navigate("/signup", { 
            state: { 
              returnTo: location.pathname + location.search,
              bookingData: {
                cleaningType,
                typeOfService,
                amcFrequency,
                selectedServices,
                serviceSqft,
                form
              }
            } 
          });
        }
      });
      return;
    }

    if (!cleaningType) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please select a cleaning type",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (!typeOfService) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please select Type of Service",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (typeOfService === "amc" && !amcFrequency) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please select AMC Frequency",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (selectedServices.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please select at least one service",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const missingServices = selectedServices.filter(
      (service) => !serviceSqft[service]
    );

    if (missingServices.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: `Please select square footage for: ${missingServices.join(", ")}`,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!form.customer_name || !form.mobile || !form.address || !form.booking_date) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all your details including booking date",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

    try {
      const servicesWithSqft = selectedServices.map(
        (service) => `${service} (${serviceSqft[service]})`
      );

      const response = await axios.post("https://splash-shine-api.onrender.com/book", {
        customer_name: form.customer_name,
        mobile: form.mobile,
        address: form.address,
        booking_date: form.booking_date,
        cleaning_type: cleaningType,
        type_of_service: typeOfService,
        amc_frequency: amcFrequency,
        price_per_hour: price,
        hours: totalHours,
        total_price: finalAmount,
        services: servicesWithSqft,
        category: urlType,
      });

      // Navigate to payment page with booking details
      navigate("/payment", {
        state: {
          bookingId: response.data.booking_id,
          customerName: response.data.customer_name,
          mobile: response.data.mobile,
          address: form.address,
          cleaningType: response.data.cleaning_type,
          bookingDate: response.data.booking_date,
          hours: response.data.hours,
          totalPrice: response.data.total_price,
          services: servicesWithSqft,
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      
      let errorMessage = "Something went wrong.";
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      } else {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: errorMessage,
        timer: 3000,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {cleaningCategory}
          </h1>
          <p className="text-gray-600">
            Schedule your cleaning service with ease
          </p>
        </div>

        {/* Cleaning Type */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-3">
            Select Cleaning Type <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border-2 border-gray-200 p-3 rounded-xl"
            value={cleaningType}
            onChange={(e) => selectCleaningType(e.target.value)}
          >
            <option value="">Choose Type</option>
            <option value="normal">Normal Cleaning (₹600/hour)</option>
            <option value="deep">Deep Cleaning (₹1000/hour)</option>
          </select>
        </div>

        {/* Type of Service */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-3">
            Type of Service <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border-2 border-gray-200 p-3 rounded-xl"
            value={typeOfService}
            onChange={(e) => setTypeOfService(e.target.value)}
          >
            <option value="">Choose Option</option>
            <option value="one_time">One Time</option>
            <option value="amc">AMC</option>
          </select>
        </div>

        {/* AMC Frequency */}
        {typeOfService === "amc" && (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-3">
              Select AMC Frequency <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border-2 border-gray-200 p-3 rounded-xl"
              value={amcFrequency}
              onChange={(e) => setAmcFrequency(e.target.value)}
            >
              <option value="">Choose Option</option>
              <option value="3_months">Per 3 Months (₹100 Discount)</option>
              <option value="6_months">Per 6 Months (₹250 Discount)</option>
              <option value="12_months">Per 12 Months (₹500 Discount)</option>
            </select>
          </div>
        )}

        {/* Services */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-3">
            Select Services <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto p-2 border-2 border-gray-200 rounded-xl">
            {SERVICES.map((service) => (
              <div
                key={service}
                className={`border-2 p-4 rounded-lg ${
                  selectedServices.includes(service)
                    ? "border-cyan-400 bg-cyan-50"
                    : "border-gray-200"
                }`}
              >
                <label className="flex gap-2 items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service)}
                    onChange={() => handleServiceSelect(service)}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <span className="text-sm font-semibold">{service}</span>
                </label>

                {selectedServices.includes(service) && (
                  <div className="mt-3 ml-6">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Select Square Footage *
                    </label>
                    <select
                      value={serviceSqft[service] || ""}
                      onChange={(e) =>
                        handleSqftChange(service, e.target.value)
                      }
                      className="w-full border-2 border-gray-300 p-2 rounded-lg text-sm"
                    >
                      <option value="">Choose square footage</option>
                      {SQFT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.label}>
                          {option.label} ({option.hours} hours)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hours */}
        {cleaningType && totalHours > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-lg font-bold text-blue-700">
              Total Hours: {totalHours}
            </p>
          </div>
        )}

        {/* Amount with Discount Breakdown */}
        {cleaningType && totalHours > 0 && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-700">Total Amount:</p>
              <p className="text-lg font-semibold text-gray-700">₹{total.toFixed(2)}</p>
            </div>
            
            {discount > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-orange-600">AMC Discount:</p>
                  <p className="text-lg font-semibold text-orange-600">- ₹{discount.toFixed(2)}</p>
                </div>
                
                <div className="border-t-2 border-green-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-green-700">Final Amount:</p>
                    <p className="text-xl font-bold text-green-700">₹{finalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <p className="text-sm text-green-600 font-semibold mt-2">
                  🎉 You saved ₹{discount} with AMC!
                </p>
              </>
            )}
            
            {discount === 0 && (
              <div className="border-t-2 border-green-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-green-700">Final Amount:</p>
                  <p className="text-xl font-bold text-green-700">₹{total.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Details */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Your Details
          </h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full border-2 p-3 rounded-xl"
                value={form.customer_name}
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                className="w-full border-2 p-3 rounded-xl"
                value={form.mobile}
                onChange={(e) =>
                  setForm({ ...form, mobile: e.target.value })
                }
              />
            </div>

            {/* Address */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter your complete address"
                rows="3"
                className="w-full border-2 p-3 rounded-xl"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </div>

            {/* Booking Date */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Preferred Booking Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={getTodayDate()}
                className="w-full border-2 p-3 rounded-xl"
                value={form.booking_date}
                onChange={(e) =>
                  setForm({ ...form, booking_date: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Select the date when you want the service
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={submitBooking}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl disabled:bg-gray-400 hover:bg-blue-700 transition-all font-semibold"
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}