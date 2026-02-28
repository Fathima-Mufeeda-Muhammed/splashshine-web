import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "https://splash-shine-api.onrender.com";

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/admin/bookings`)
      .then(res => {
        if (res.data.bookings && Array.isArray(res.data.bookings)) {
          const processedBookings = res.data.bookings.map(booking => {
            let paidAmount = 0;
            let paymentStatus = 'no_payment';

            if (booking.payment_status === 'approved') {
              paidAmount = booking.total_price * 0.5;
              paymentStatus = 'approved';
            } else if (booking.payment_status === 'pending') {
              paidAmount = 0;
              paymentStatus = 'pending';
            } else if (booking.payment_status === 'rejected') {
              paidAmount = 0;
              paymentStatus = 'rejected';
            } else {
              paymentStatus = 'no_payment';
            }

            const remainingAmount = booking.total_price - paidAmount;
            let duePaymentStatus = 'pending';
            if (booking.due_payment_status) {
              duePaymentStatus = booking.due_payment_status;
            } else if (remainingAmount === 0) {
              duePaymentStatus = 'paid';
            }

            return {
              ...booking,
              paid_amount: paidAmount.toFixed(2),
              remaining_amount: remainingAmount.toFixed(2),
              display_payment_status: paymentStatus,
              due_payment_status: duePaymentStatus
            };
          });
          setBookings(processedBookings);
        } else {
          setBookings([]);
          setError("Invalid data format received");
        }
      })
      .catch(err => {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Server may be waking up, please wait and retry.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  const handleDuePaymentStatusChange = (bookingId, newStatus, currentStatus) => {
    Swal.fire({
      title: 'Confirm Status Change',
      html: `
        <div class="text-left">
          <p class="mb-2">Change due payment status?</p>
          <div class="bg-gray-100 p-3 rounded mt-3">
            <p class="text-sm"><strong>Booking ID:</strong> BK${bookingId}</p>
            <p class="text-sm mt-1"><strong>New Status:</strong> <span class="text-green-600">${newStatus === 'pending' ? 'PENDING DUE' : 'PAID'}</span></p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        axios.put(`${API_URL}/admin/bookings/${bookingId}/due-payment-status`, { due_payment_status: newStatus })
          .then(() => {
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, due_payment_status: newStatus } : b));
            Swal.fire({
              icon: 'success',
              title: 'Updated!',
              text: `Due payment status updated to ${newStatus === 'pending' ? 'PENDING DUE' : 'PAID'}`,
              confirmButtonColor: '#10b981',
              timer: 2500,
              timerProgressBar: true
            });
          })
          .catch(err => {
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: err.response?.data?.message || 'Please try again.',
              confirmButtonColor: '#ef4444'
            });
          });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading bookings...</div>
          <div className="text-sm text-gray-400 mt-2">Server may be waking up, please wait...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
          <button onClick={fetchBookings} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">All Bookings</h1>
              <p className="text-gray-600">Manage and track all customer bookings</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-5 py-2.5 rounded-full font-semibold text-lg shadow-sm">
                Total: {bookings.length}
              </div>
              <button onClick={fetchBookings} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-200">
                🔄 Refresh
              </button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">When customers make bookings, they will appear here.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Booking ID", "Customer Details", "Service Info", "Total Amount", "Paid Amount", "Due Amount", "Advance Payment", "Due Payment Status"].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-bold text-xs">#{b.id}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">BK{b.id}</div>
                              <div className="text-xs text-gray-500">
                                {b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN') : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900">{b.customer_name}</div>
                            <div className="text-sm text-gray-600">{b.mobile}</div>
                            {b.address && (
                              <div className="text-xs text-gray-500 truncate max-w-[200px]" title={b.address}>
                                📍 {b.address}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              b.cleaning_type === 'deep_cleaning' ? 'bg-purple-100 text-purple-700' :
                              b.cleaning_type === 'regular_cleaning' ? 'bg-blue-100 text-blue-700' :
                              b.cleaning_type === 'move_in_move_out' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {b.cleaning_type?.replace(/_/g, ' ') || 'N/A'}
                            </span>
                            <div className="text-sm text-gray-600">{b.hours || '0'} hour(s)</div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <div className="text-lg font-bold text-gray-900">₹{parseFloat(b.total_price).toFixed(2)}</div>
                          <div className="text-xs text-gray-500 mt-1">Total Price</div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <div className={`text-lg font-bold ${parseFloat(b.paid_amount) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            ₹{b.paid_amount}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <div className={`text-lg font-bold ${parseFloat(b.remaining_amount) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            ₹{b.remaining_amount}
                          </div>
                          {parseFloat(b.remaining_amount) === 0 && (
                            <div className="text-xs text-green-500 mt-1">Fully Paid</div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              b.display_payment_status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                              b.display_payment_status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                              b.display_payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              'bg-gray-50 text-gray-600 border border-gray-300'
                            }`}>
                              {b.display_payment_status === 'approved' && 'PAID'}
                              {b.display_payment_status === 'rejected' && 'REJECTED'}
                              {b.display_payment_status === 'pending' && 'PENDING'}
                              {b.display_payment_status === 'no_payment' && 'NO PAYMENT'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center space-y-2">
                            {parseFloat(b.remaining_amount) === 0 ? (
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                                FULLY PAID
                              </span>
                            ) : (
                              <>
                                <select
                                  value={b.due_payment_status}
                                  onChange={(e) => handleDuePaymentStatusChange(b.id, e.target.value, b.due_payment_status)}
                                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer transition-all ${
                                    b.due_payment_status === 'paid'
                                      ? 'bg-green-50 text-green-700 border-green-300'
                                      : 'bg-orange-50 text-orange-700 border-orange-300'
                                  }`}
                                >
                                  <option value="pending">PENDING DUE</option>
                                  <option value="paid">PAID</option>
                                </select>
                                <div className={`text-xs px-3 py-1 rounded ${b.due_payment_status === 'pending' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                                  {b.due_payment_status === 'pending' ? '⏳ Awaiting balance' : '✅ Balance received'}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-sm text-blue-700 mb-1">Total Bookings</div>
                  <div className="text-3xl font-bold text-blue-800">{bookings.length}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-sm text-purple-700 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-purple-800">
                    ₹{bookings.reduce((sum, b) => sum + parseFloat(b.total_price), 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-sm text-green-700 mb-1">Amount Collected</div>
                  <div className="text-3xl font-bold text-green-800">
                    ₹{bookings.filter(b => b.display_payment_status === 'approved').reduce((sum, b) => sum + parseFloat(b.paid_amount), 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-sm text-yellow-700 mb-1">Pending Advances</div>
                  <div className="text-3xl font-bold text-yellow-800">
                    {bookings.filter(b => b.display_payment_status === 'pending').length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-sm text-orange-700 mb-1">Pending Due</div>
                  <div className="text-3xl font-bold text-orange-800">
                    ₹{bookings.filter(b => b.due_payment_status === 'pending').reduce((sum, b) => sum + parseFloat(b.remaining_amount), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsList;