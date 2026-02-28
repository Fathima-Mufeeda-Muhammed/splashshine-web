import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://splash-shine-api.onrender.com";

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/admin/payments`)
      .then(res => {
        if (res.data.payments && Array.isArray(res.data.payments)) {
          const processedPayments = res.data.payments.map(payment => {
            const totalAmount = payment.booking_amount || payment.total_amount || (payment.amount * 2);
            let paidAmount = 0;
            if (payment.status === 'approved') {
              paidAmount = payment.due_payment_status === 'paid' ? totalAmount : totalAmount * 0.5;
            }
            return {
              ...payment,
              total_amount: totalAmount,
              calculated_paid_amount: paidAmount,
              remaining_amount: totalAmount - paidAmount
            };
          });
          setPayments(processedPayments);
        } else {
          setPayments([]);
          setError("Invalid data format received");
        }
      })
      .catch(err => {
        console.error("Error fetching payments:", err);
        setError("Failed to load payments. Server may be waking up, please retry.");
        setPayments([]);
      })
      .finally(() => setLoading(false));
  };

  const updatePaymentStatus = (paymentId, newStatus) => {
    axios.put(`${API_URL}/admin/payment/status/${paymentId}`, { status: newStatus })
      .then(() => {
        fetchPayments();
        alert(`Payment ${newStatus} successfully!`);
      })
      .catch(err => {
        console.error("Error updating payment status:", err);
        alert("Failed to update payment status. Please try again.");
      });
  };

  const viewInvoice = (bookingId, customerName, paidAmount, totalAmount, status) => {
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Booking #${bookingId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .invoice-title { font-size: 28px; margin: 20px 0; font-weight: bold; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; }
          .total-row { background-color: #dcfce7; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SPLASH SHINE SOLUTION</div>
          <div>Professional Cleaning Services</div>
          <div>Phone: +91-8137070424 | Email: info@splashshine.com</div>
        </div>
        <div class="invoice-title">INVOICE</div>
        <div class="section">
          <div class="section-title">Invoice Details</div>
          <div>Invoice No: INV-${bookingId}-${Date.now().toString().slice(-4)}</div>
          <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
          <div>Booking ID: #${bookingId}</div>
          <div>Status: ${status.toUpperCase()}</div>
        </div>
        <div class="section">
          <div class="section-title">Customer</div>
          <div>${customerName}</div>
        </div>
        <div class="section">
          <div class="section-title">Payment Breakdown</div>
          <table>
            <tr><th>Description</th><th>Amount</th></tr>
            <tr><td>Service Charges (excl. GST)</td><td>₹${(totalAmount / 1.18).toFixed(2)}</td></tr>
            <tr><td>GST (18%)</td><td>₹${(totalAmount - totalAmount / 1.18).toFixed(2)}</td></tr>
            <tr class="total-row"><td>Total (incl. GST)</td><td>₹${totalAmount.toFixed(2)}</td></tr>
            <tr><td>Amount Paid</td><td>₹${paidAmount.toFixed(2)}</td></tr>
            <tr><td>Remaining Balance</td><td>₹${(totalAmount - paidAmount).toFixed(2)}</td></tr>
          </table>
        </div>
        <div class="footer">Thank you for choosing Splash Shine Solution!</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
  };

  const viewQuotation = (bookingId, customerName, totalAmount, cleaningType, hours) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - Booking #${bookingId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #10b981; }
          .title { font-size: 28px; margin: 20px 0; font-weight: bold; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; }
          .total-row { background-color: #dcfce7; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SPLASH SHINE SOLUTION</div>
          <div>Professional Cleaning Services</div>
          <div>Phone: +91-8137070424 | Email: info@splashshine.com</div>
        </div>
        <div class="title">QUOTATION</div>
        <div class="section">
          <div class="section-title">Quotation Details</div>
          <div>Quotation No: QUO-${bookingId}-${Date.now().toString().slice(-4)}</div>
          <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
          <div>Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-IN')}</div>
        </div>
        <div class="section">
          <div class="section-title">Customer</div>
          <div>${customerName}</div>
        </div>
        <div class="section">
          <div class="section-title">Service</div>
          <div>Type: ${cleaningType || 'N/A'} | Duration: ${hours || '0'} hour(s)</div>
        </div>
        <div class="section">
          <div class="section-title">Price Breakdown</div>
          <table>
            <tr><th>Description</th><th>Amount</th></tr>
            <tr><td>Service Charges (excl. GST)</td><td>₹${(totalAmount / 1.18).toFixed(2)}</td></tr>
            <tr><td>GST (18%)</td><td>₹${(totalAmount - totalAmount / 1.18).toFixed(2)}</td></tr>
            <tr class="total-row"><td>Total Quoted Amount</td><td>₹${totalAmount.toFixed(2)}</td></tr>
            <tr><td>Advance Required (50%)</td><td>₹${(totalAmount * 0.5).toFixed(2)}</td></tr>
            <tr><td>Balance on Completion (50%)</td><td>₹${(totalAmount * 0.5).toFixed(2)}</td></tr>
          </table>
        </div>
        <div class="footer">We look forward to serving you! | Valid for 30 days</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600">Loading payments...</span>
          <span className="text-sm text-gray-400 mt-1">Server may be waking up, please wait...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPayments} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Records ({payments.length})</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total Collected: ₹{payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.calculated_paid_amount, 0).toFixed(2)}
          </div>
          <button onClick={fetchPayments} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">
            🔄 Refresh
          </button>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No payments found</p>
          <p className="text-sm text-gray-500 mt-1">When payments are made, they will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["ID", "Customer", "Method", "Transaction ID", "Amounts", "Payment Status", "Documents"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium">{p.customer_name}</div>
                      {p.customer_email && <div className="text-xs text-gray-500">{p.customer_email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {p.payment_method?.toUpperCase() || 'UPI'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.transaction_id ? (
                        <div className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200 break-all">{p.transaction_id}</div>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold">₹{p.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Paid:</span>
                          <span className={`font-semibold ${p.calculated_paid_amount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            ₹{p.calculated_paid_amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Due:</span>
                          <span className={`font-semibold ${p.remaining_amount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            ₹{p.remaining_amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs mt-1">
                          <span className="text-gray-500">Advance: </span>
                          <span className={`font-semibold ${p.status === 'approved' ? 'text-green-600' : p.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {p.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Balance: </span>
                          <span className={`font-semibold ${p.due_payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                            {p.due_payment_status === 'paid' ? 'PAID' : 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          p.status === 'approved' ? 'bg-green-100 text-green-800' :
                          p.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {p.status?.toUpperCase()}
                        </span>
                        {p.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updatePaymentStatus(p.id, 'approved')}
                              className="px-2 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700"
                              title="Approve"
                            >✓</button>
                            <button
                              onClick={() => updatePaymentStatus(p.id, 'rejected')}
                              className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700"
                              title="Reject"
                            >✕</button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewInvoice(p.booking_id || p.id, p.customer_name, p.calculated_paid_amount, p.total_amount, p.status)}
                          className="px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                        >Invoice</button>
                        <button
                          onClick={() => viewQuotation(p.booking_id || p.id, p.customer_name, p.total_amount, p.cleaning_type, p.hours)}
                          className="px-3 py-1.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700"
                        >Quotation</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Payments</div>
                <div className="font-semibold text-gray-800">{payments.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Collected</div>
                <div className="font-semibold text-green-600">
                  ₹{payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.calculated_paid_amount, 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Pending Approvals</div>
                <div className="font-semibold text-yellow-600">{payments.filter(p => p.status === 'pending').length}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Outstanding</div>
                <div className="font-semibold text-orange-600">
                  ₹{payments.reduce((sum, p) => sum + p.remaining_amount, 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;