import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    axios.get("http://localhost:8000/admin/bookings")
      .then(res => {
        console.log("Bookings response:", res.data);
        if (res.data.bookings && Array.isArray(res.data.bookings)) {
          // Process bookings to calculate paid amount
          const processedBookings = res.data.bookings.map(booking => {
            // Calculate paid amount based on payment status
            let paidAmount = 0;
            let paymentStatus = 'no_payment';
            
            if (booking.payment_status === 'approved') {
              // If payment is approved, assume 50% advance is paid
              paidAmount = booking.total_price * 0.5;
              paymentStatus = 'approved';
            } else if (booking.payment_status === 'pending') {
              // If payment is pending, show 0 paid
              paidAmount = 0;
              paymentStatus = 'pending';
            } else if (booking.payment_status === 'rejected') {
              // If payment is rejected, show 0 paid
              paidAmount = 0;
              paymentStatus = 'rejected';
            } else {
              // No payment record
              paymentStatus = 'no_payment';
            }
            
            const remainingAmount = booking.total_price - paidAmount;
            
            // Determine due payment status
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
        setError(err.message || "Failed to fetch bookings");
        setBookings([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDuePaymentStatusChange = (bookingId, newStatus, currentStatus) => {
    // Show confirmation dialog
    Swal.fire({
      title: 'Confirm Status Change',
      html: `
        <div class="text-left">
          <p class="mb-2">Are you sure you want to change the due payment status?</p>
          <div class="bg-gray-100 p-3 rounded mt-3">
            <p class="text-sm"><strong>Booking ID:</strong> BK${bookingId}</p>
            <p class="text-sm mt-1"><strong>Current Status:</strong> <span class="text-orange-600">${currentStatus === 'pending' ? 'PENDING DUE' : 'PAID'}</span></p>
            <p class="text-sm mt-1"><strong>New Status:</strong> <span class="text-green-600">${newStatus === 'pending' ? 'PENDING DUE' : 'PAID'}</span></p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Update Status',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading
        Swal.fire({
          title: 'Updating...',
          text: 'Please wait while we update the payment status',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Update the status on the backend
        axios.put(`http://localhost:8000/admin/bookings/${bookingId}/due-payment-status`, {
          due_payment_status: newStatus
        })
          .then(res => {
            console.log("Due payment status updated:", res.data);
            
            // Update local state
            setBookings(prevBookings => 
              prevBookings.map(booking => 
                booking.id === bookingId 
                  ? { ...booking, due_payment_status: newStatus }
                  : booking
              )
            );

            // Show success message
            Swal.fire({
              icon: 'success',
              title: 'Status Updated!',
              html: `
                <div class="text-center">
                  <p class="mb-2">Due payment status has been successfully updated</p>
                  <div class="bg-green-50 p-3 rounded mt-3 inline-block">
                    <p class="text-sm"><strong>Booking ID:</strong> BK${bookingId}</p>
                    <p class="text-sm mt-1"><strong>New Status:</strong> <span class="text-green-600 font-semibold">${newStatus === 'pending' ? 'PENDING DUE' : 'PAID'}</span></p>
                  </div>
                </div>
              `,
              confirmButtonColor: '#10b981',
              timer: 3000,
              timerProgressBar: true
            });
          })
          .catch(err => {
            console.error("Error updating due payment status:", err);
            
            // Show error message
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              html: `
                <div class="text-center">
                  <p class="mb-2">Failed to update due payment status</p>
                  <div class="bg-red-50 p-3 rounded mt-3">
                    <p class="text-sm text-red-600">${err.response?.data?.message || err.message || 'An error occurred. Please try again.'}</p>
                  </div>
                </div>
              `,
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'OK'
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg m-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Error:</span>
          <span className="ml-2">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">All Bookings</h1>
              <p className="text-gray-600">Manage and track all customer bookings</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-5 py-2.5 rounded-full font-semibold text-lg shadow-sm">
                Total: {bookings.length}
              </div>
              <div className="bg-green-100 text-green-800 px-5 py-2.5 rounded-full font-semibold text-lg shadow-sm">
                ₹{bookings
                  .filter(b => b.display_payment_status === 'approved')
                  .reduce((sum, b) => sum + parseFloat(b.paid_amount), 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When customers make bookings through your website, they will appear here for management.
              </p>
            </div>
          ) : (
            <>
              {/* Main Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Customer Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Service Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Due Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Advance Payment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Due Payment Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors duration-150">
                        {/* Booking ID */}
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-bold">#{b.id}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">BK{b.id}</div>
                              <div className="text-xs text-gray-500">
                                {b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN') : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Customer Details */}
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

                        {/* Service Info */}
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                b.cleaning_type === 'deep_cleaning' ? 'bg-purple-100 text-purple-700' :
                                b.cleaning_type === 'regular_cleaning' ? 'bg-blue-100 text-blue-700' :
                                b.cleaning_type === 'move_in_move_out' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {b.cleaning_type?.replace(/_/g, ' ') || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{b.hours || '0'} hour(s)</span>
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="px-6 py-5">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{parseFloat(b.total_price).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Total Price</div>
                          </div>
                        </td>

                        {/* Paid Amount */}
                        <td className="px-6 py-5">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${
                              parseFloat(b.paid_amount) > 0 ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              ₹{b.paid_amount}
                            </div>
                            {parseFloat(b.paid_amount) > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                ({((parseFloat(b.paid_amount) / parseFloat(b.total_price)) * 100).toFixed(0)}%)
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Due Amount */}
                        <td className="px-6 py-5">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${
                              parseFloat(b.remaining_amount) > 0 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              ₹{b.remaining_amount}
                            </div>
                            {parseFloat(b.remaining_amount) > 0 ? (
                              <div className="text-xs text-orange-500 mt-1">
                                ({((parseFloat(b.remaining_amount) / parseFloat(b.total_price)) * 100).toFixed(0)}%)
                              </div>
                            ) : (
                              <div className="text-xs text-green-500 mt-1">Fully Paid</div>
                            )}
                          </div>
                        </td>

                        {/* Advance Payment Status */}
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              b.display_payment_status === 'approved' 
                                ? 'bg-green-50 text-green-700 border border-green-200' :
                              b.display_payment_status === 'rejected' 
                                ? 'bg-red-50 text-red-700 border border-red-200' :
                              b.display_payment_status === 'pending' 
                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                'bg-gray-50 text-gray-600 border border-gray-300'
                            }`}>
                              {b.display_payment_status === 'approved' && (
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {b.display_payment_status === 'pending' && (
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              )}
                              {b.display_payment_status === 'rejected' && (
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                              {b.display_payment_status === 'no_payment' && (
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              )}
                              {b.display_payment_status === 'approved' && 'PAID'}
                              {b.display_payment_status === 'rejected' && 'REJECTED'}
                              {b.display_payment_status === 'pending' && 'PENDING'}
                              {b.display_payment_status === 'no_payment' && 'NO PAYMENT'}
                            </span>
                          </div>
                        </td>

                        {/* Due Payment Status */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center space-y-2">
                            {parseFloat(b.remaining_amount) === 0 ? (
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                FULLY PAID
                              </span>
                            ) : (
                              <>
                                <select
                                  value={b.due_payment_status}
                                  onChange={(e) => handleDuePaymentStatusChange(b.id, e.target.value, b.due_payment_status)}
                                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer transition-all ${
                                    b.due_payment_status === 'paid'
                                      ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                                      : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                                  }`}
                                >
                                  <option value="pending">PENDING DUE</option>
                                  <option value="paid">PAID</option>
                                </select>
                                
                                {b.due_payment_status === 'pending' && (
                                  <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded">
                                    ⏳ Awaiting balance payment
                                  </div>
                                )}
                                {b.due_payment_status === 'paid' && (
                                  <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded">
                                    ✅ Balance payment received
                                  </div>
                                )}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Total Bookings</div>
                      <div className="text-3xl font-bold text-blue-800">{bookings.length}</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-purple-700 mb-1">Total Revenue</div>
                      <div className="text-3xl font-bold text-purple-800">
                        ₹{bookings
                          .reduce((sum, b) => sum + parseFloat(b.total_price), 0)
                          .toFixed(2)}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">All bookings combined</div>
                    </div>
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-700 mb-1">Amount Collected</div>
                      <div className="text-3xl font-bold text-green-800">
                        ₹{bookings
                          .filter(b => b.display_payment_status === 'approved')
                          .reduce((sum, b) => sum + parseFloat(b.paid_amount), 0)
                          .toFixed(2)}
                      </div>
                      <div className="text-xs text-green-600 mt-1">Advance payments received</div>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-yellow-700 mb-1">Pending Advances</div>
                      <div className="text-3xl font-bold text-yellow-800">
                        {bookings.filter(b => b.display_payment_status === 'pending').length}
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">Awaiting confirmation</div>
                    </div>
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-700 mb-1">Pending Due</div>
                      <div className="text-3xl font-bold text-orange-800">
                        ₹{bookings
                          .filter(b => b.due_payment_status === 'pending')
                          .reduce((sum, b) => sum + parseFloat(b.remaining_amount), 0)
                          .toFixed(2)}
                      </div>
                      <div className="text-xs text-orange-600 mt-1">Balance to be collected</div>
                    </div>
                    <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
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
