import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MobileCarWashPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    mobile: "",
    address: "",
    vehicle_type: "",
    wash_type: "",
    car_size: "",
    extra_services: [],
    price: 0,
  });

  const [errors, setErrors] = useState({});

  const prices = {
    normal: {
      small: 300,
      medium: 500,
      large: 600,
    },
    premium: {
      small: 350,
      medium: 550,
      large: 650,
    },
    two_wheeler: 250,
  };

  const handlePriceCalculation = (updatedForm) => {
    let price = 0;

    if (updatedForm.vehicle_type === "2_wheeler") {
      price = prices.two_wheeler;
    } else if (updatedForm.vehicle_type === "4_wheeler") {
      if (updatedForm.wash_type && updatedForm.car_size) {
        price =
          prices[updatedForm.wash_type]?.[updatedForm.car_size] || 0;
      }
    }

    // Extra services only for 4-wheeler
    if (updatedForm.vehicle_type === "4_wheeler") {
      price += updatedForm.extra_services.length * 100;
    }

    setForm({ ...updatedForm, price });
  };

  const handleCheckboxChange = (service) => {
    let updatedServices = [...form.extra_services];

    if (updatedServices.includes(service)) {
      updatedServices = updatedServices.filter((s) => s !== service);
    } else {
      updatedServices.push(service);
    }

    handlePriceCalculation({ ...form, extra_services: updatedServices });
  };

  // Validation
  const validate = () => {
    let newErrors = {};

    if (!form.customer_name.trim())
      newErrors.customer_name = "Full name is required";

    if (!form.mobile.trim())
      newErrors.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile))
      newErrors.mobile = "Enter a valid 10-digit mobile number";

    if (!form.address.trim())
      newErrors.address = "Address is required";

    if (!form.vehicle_type.trim())
      newErrors.vehicle_type = "Select vehicle type";

    if (form.vehicle_type === "4_wheeler") {
      if (!form.wash_type.trim())
        newErrors.wash_type = "Select wash type";

      if (!form.car_size.trim())
        newErrors.car_size = "Select car size";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Generate a unique booking ID
    const bookingId = `MCW${Date.now()}`;

    // Format cleaning type description
    let cleaningType = "";
    if (form.vehicle_type === "2_wheeler") {
      cleaningType = "Two Wheeler Wash";
    } else if (form.vehicle_type === "4_wheeler") {
      const washTypeLabel = form.wash_type === "normal" ? "Normal" : "Premium";
      const sizeLabel = form.car_size === "small" ? "Small" : form.car_size === "medium" ? "Medium" : "Large";
      cleaningType = `${washTypeLabel} Wash - ${sizeLabel} Car`;
      
      if (form.extra_services.length > 0) {
        cleaningType += ` + ${form.extra_services.join(", ")}`;
      }
    }

    navigate("/payment", {
      state: {
        bookingId: bookingId,
        customerName: form.customer_name,
        mobile: form.mobile,
        address: form.address,
        cleaningType: cleaningType,
        vehicleType: form.vehicle_type,
        washType: form.wash_type,
        carSize: form.car_size,
        extraServices: form.extra_services,
        hours: 1, // Default to 1 hour for car wash
        totalPrice: form.price,
        service: "Mobile Car Wash"
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Mobile Car Wash Booking
      </h2>

      {/* FULL NAME */}
      <label className="font-semibold">Full Name</label>
      <input
        type="text"
        className="w-full border-2 p-3 rounded-xl mt-1"
        value={form.customer_name}
        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
      />
      {errors.customer_name && (
        <p className="text-red-500 text-sm">{errors.customer_name}</p>
      )}

      {/* MOBILE */}
      <label className="font-semibold mt-4 block">Mobile Number</label>
      <input
        type="tel"
        className="w-full border-2 p-3 rounded-xl mt-1"
        value={form.mobile}
        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
      />
      {errors.mobile && (
        <p className="text-red-500 text-sm">{errors.mobile}</p>
      )}

      {/* ADDRESS */}
      <label className="font-semibold mt-4 block">Address</label>
      <textarea
        rows="3"
        className="w-full border-2 p-3 rounded-xl mt-1"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      {errors.address && (
        <p className="text-red-500 text-sm">{errors.address}</p>
      )}

      {/* VEHICLE TYPE */}
      <label className="font-semibold mt-4 block">Vehicle Type</label>
      <select
        className="w-full border-2 p-3 rounded-xl mt-1"
        value={form.vehicle_type}
        onChange={(e) => {
          const updatedForm = {
            ...form,
            vehicle_type: e.target.value,
            wash_type: "",
            car_size: "",
            extra_services: [],
          };
          handlePriceCalculation(updatedForm);
        }}
      >
        <option value="">Select Vehicle Type</option>
        <option value="2_wheeler">Two-Wheeler</option>
        <option value="4_wheeler">Four-Wheeler</option>
      </select>
      {errors.vehicle_type && (
        <p className="text-red-500 text-sm">{errors.vehicle_type}</p>
      )}

      {/* SHOW EXTRA FIELDS ONLY FOR 4-WHEELER */}
      {form.vehicle_type === "4_wheeler" && (
        <>
          {/* WASH TYPE */}
          <label className="font-semibold mt-4 block">Wash Type</label>
          <select
            className="w-full border-2 p-3 rounded-xl mt-1"
            value={form.wash_type}
            onChange={(e) => {
              const updatedForm = { ...form, wash_type: e.target.value };
              handlePriceCalculation(updatedForm);
            }}
          >
            <option value="">Select Wash Type</option>
            <option value="normal">Normal Wash</option>
            <option value="premium">Premium Wash</option>
          </select>
          {errors.wash_type && (
            <p className="text-red-500 text-sm">{errors.wash_type}</p>
          )}

          {/* CAR SIZE */}
          <label className="font-semibold mt-4 block">Car Size</label>
          <select
            className="w-full border-2 p-3 rounded-xl mt-1"
            value={form.car_size}
            onChange={(e) => {
              const updatedForm = { ...form, car_size: e.target.value };
              handlePriceCalculation(updatedForm);
            }}
          >
            <option value="">Select Car Size</option>
            <option value="small">Small Car</option>
            <option value="medium">Medium Car</option>
            <option value="large">Large Car</option>
          </select>
          {errors.car_size && (
            <p className="text-red-500 text-sm">{errors.car_size}</p>
          )}

          {/* EXTRA SERVICES - ONLY FOR 4-WHEELER */}
          <label className="font-semibold mt-4 block">
            Extra Services (₹100 each)
          </label>

          <div className="mt-2 space-y-2">
            {["Car Polish", "Car Waxing", "Car Scratch Removal"].map((service) => (
              <div key={service}>
                <input
                  type="checkbox"
                  checked={form.extra_services.includes(service)}
                  onChange={() => handleCheckboxChange(service)}
                />
                <span className="ml-2">{service}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PRICE BOX */}
      <div className="mt-6 p-4 border-2 rounded-xl bg-gray-50 text-center text-lg font-semibold">
        Total Price: ₹{form.price}
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
      >
        Continue to Payment
      </button>
    </div>
  );
};

export default MobileCarWashPage;