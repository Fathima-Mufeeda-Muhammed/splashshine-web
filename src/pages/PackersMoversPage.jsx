import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PackersMoversPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    mobile: "",
    address: "",
    goods_type: "",
    distance_km: "",
    price: 0,
  });

  const [errors, setErrors] = useState({});

  const calculatePrice = (updatedForm) => {
    let price = 0;

    if (updatedForm.distance_km) {
      price = updatedForm.distance_km * 1000;
    }

    setForm({ ...updatedForm, price });
  };

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

    if (!form.goods_type.trim())
      newErrors.goods_type = "Select goods type";

    if (!form.distance_km)
      newErrors.distance_km = "Enter distance in kilometers";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = () => {
  if (!validate()) return;

  // Generate a unique booking ID
  const bookingId = `PM${Date.now()}`;

  // Format the service description
  const cleaningType = `${form.goods_type.replace('_', ' ')} - ${form.distance_km} KM`;

  navigate("/payment", {
    state: {
      bookingId: bookingId,
      customerName: form.customer_name,
      mobile: form.mobile,
      address: form.address,
      cleaningType: cleaningType,
      goodsType: form.goods_type,
      distanceKm: form.distance_km,
      hours: 1, // Default for packers & movers
      totalPrice: form.price,
      service: "Packers & Movers"
    },
  });
};

  return (
    <div className="max-w-xl mx-auto p-6 mt-8">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Packers & Movers Booking
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
      <label className="font-semibold mt-4 block">Pickup Address</label>
      <textarea
        rows="3"
        className="w-full border-2 p-3 rounded-xl mt-1"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      {errors.address && (
        <p className="text-red-500 text-sm">{errors.address}</p>
      )}

      {/* GOODS TYPE */}
      <label className="font-semibold mt-4 block">Select Goods Type</label>
      <select
        className="w-full border-2 p-3 rounded-xl mt-1"
        value={form.goods_type}
        onChange={(e) =>
          setForm({ ...form, goods_type: e.target.value })
        }
      >
        <option value="">Select Goods</option>
        <option value="home_items">Home Items</option>
        <option value="office_items">Office Items</option>
        <option value="furniture">Furniture Only</option>
        <option value="electronics">Electronics</option>
      </select>
      {errors.goods_type && (
        <p className="text-red-500 text-sm">{errors.goods_type}</p>
      )}

      {/* DISTANCE */}
      <label className="font-semibold mt-4 block">Distance (KM)</label>
      <input
        type="number"
        className="w-full border-2 p-3 rounded-xl mt-1"
        value={form.distance_km}
        onChange={(e) =>
          calculatePrice({ ...form, distance_km: e.target.value })
        }
        placeholder="Enter distance in kilometers"
      />
      {errors.distance_km && (
        <p className="text-red-500 text-sm">{errors.distance_km}</p>
      )}

      {/* PRICE */}
      <div className="mt-6 p-4 border-2 rounded-xl bg-gray-50 text-center text-xl font-bold">
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

export default PackersMoversPage;
