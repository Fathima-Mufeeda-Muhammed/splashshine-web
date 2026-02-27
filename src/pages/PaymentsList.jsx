import React, { useEffect, useState } from "react";
import axios from "axios";

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    setLoading(true);
    axios.get("http://localhost:8000/admin/payments")
      .then(res => {
        if (res.data.payments && Array.isArray(res.data.payments)) {
          // Process payments to calculate correct paid amounts
          const processedPayments = res.data.payments.map(payment => {
            const totalAmount = payment.booking_amount || payment.total_amount || (payment.amount * 2);
            let paidAmount = 0;
            
            // Calculate paid amount based on payment status and due payment status
            if (payment.status === 'approved') {
              // 50% advance is paid
              paidAmount = totalAmount * 0.5;
              
              // If due payment is also marked as paid, add the remaining 50%
              if (payment.due_payment_status === 'paid') {
                paidAmount = totalAmount; // Full amount is paid
              }
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
        setError(err.message || "Failed to fetch payments");
        setPayments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updatePaymentStatus = (paymentId, newStatus) => {
    axios.put(`http://localhost:8000/admin/payment/status/${paymentId}`, {
      status: newStatus
    })
      .then(() => {
        // Refresh payments after status change
        fetchPayments();
        alert(`Payment ${newStatus} successfully!`);
      })
      .catch(err => {
        console.error("Error updating payment status:", err);
        alert("Failed to update payment status");
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
          .invoice-title { font-size: 28px; margin: 20px 0; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; }
          .amount-row { background-color: #f0f9ff; }
          .total-row { background-color: #dcfce7; font-weight: bold; }
          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-approved { background-color: #d1fae5; color: #065f46; }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-rejected { background-color: #fee2e2; color: #991b1b; }
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
          <div>Invoice No: INV${bookingId}${Date.now().toString().slice(-6)}</div>
          <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
          <div>Booking ID: #${bookingId}</div>
          <div>Payment Status: 
            <span class="status-badge status-${status}">${status.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Customer Information</div>
          <div>Customer Name: ${customerName}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Payment Breakdown</div>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount (₹)</th>
            </tr>
            <tr class="amount-row">
              <td>Service Charges (Taxable)</td>
              <td>₹${(totalAmount - (totalAmount * 0.18 / 1.18)).toFixed(2)}</td>
            </tr>
            <tr class="amount-row">
              <td>GST (18%)</td>
              <td>₹${(totalAmount * 0.18 / 1.18).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount (Including GST)</td>
              <td>₹${totalAmount.toFixed(2)}</td>
            </tr>
            <tr class="amount-row">
              <td>Amount Paid</td>
              <td>₹${paidAmount.toFixed(2)}</td>
            </tr>
            <tr class="amount-row">
              <td>Remaining Balance</td>
              <td>₹${(totalAmount - paidAmount).toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Terms & Conditions</div>
          <ul>
            <li>Payment is non-refundable</li>
            <li>Service may be rescheduled with 24 hours notice</li>
            <li>All prices are inclusive of applicable taxes</li>
          </ul>
        </div>
        
        <div class="section" style="text-align: center; margin-top: 40px;">
          <div>Thank you for choosing Splash Shine Solution!</div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
  };

  const viewQuotation = (bookingId, customerName, totalAmount, cleaningType, hours) => {
    const quotationWindow = window.open('', '_blank');
    quotationWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - Booking #${bookingId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #10b981; }
          .quotation-title { font-size: 28px; margin: 20px 0; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f3f4f6; }
          .amount-row { background-color: #f0f9ff; }
          .total-row { background-color: #dcfce7; font-weight: bold; }
          .highlight { background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SPLASH SHINE SOLUTION</div>
          <div>Professional Cleaning Services</div>
          <div>Phone: +91-8137070424 | Email: info@splashshine.com</div>
        </div>
        
        <div class="quotation-title">QUOTATION</div>
        
        <div class="section">
          <div class="section-title">Quotation Details</div>
          <div>Quotation No: QUO${bookingId}${Date.now().toString().slice(-6)}</div>
          <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
          <div>Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-IN')}</div>
          <div>Booking Reference: #${bookingId}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Customer Information</div>
          <div>Customer Name: ${customerName}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Service Information</div>
          <table>
            <tr>
              <th>Service Type</th>
              <td>${cleaningType || 'Not specified'}</td>
            </tr>
            <tr>
              <th>Duration</th>
              <td>${hours || '0'} hour(s)</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Price Breakdown</div>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount (₹)</th>
            </tr>
            <tr class="amount-row">
              <td>Service Charges (Taxable)</td>
              <td>₹${(totalAmount - (totalAmount * 0.18 / 1.18)).toFixed(2)}</td>
            </tr>
            <tr class="amount-row">
              <td>GST (18%)</td>
              <td>₹${(totalAmount * 0.18 / 1.18).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Quoted Amount (Including GST)</td>
              <td>₹${totalAmount.toFixed(2)}</td>
            </tr>
            <tr class="amount-row">
              <td>Advance Required (50%)</td>
              <td>₹${(totalAmount * 0.5).toFixed(2)}</td>
            </tr>
            <tr class="amount-row">
              <td>Remaining Balance (50%)</td>
              <td>₹${(totalAmount * 0.5).toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="highlight">
          <div class="section-title">Important Notes</div>
          <ul>
            <li>This quotation is valid for 30 days from the date of issue</li>
            <li>50% advance payment required, remaining 50% due on service completion</li>
            <li>All prices are inclusive of 18% GST</li>
            <li>Prices may vary based on actual site conditions</li>
          </ul>
        </div>
        
        <div class="section" style="text-align: center; margin-top: 40px;">
          <div>We look forward to serving you!</div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-6">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Records ({payments.length})</h2>
        <div className="text-sm text-gray-500">
          Total Collected: ₹{payments
            .filter(p => p.status === 'approved')
            .reduce((sum, p) => sum + p.calculated_paid_amount, 0)
            .toFixed(2)}
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-600">No payments found</p>
          <p className="text-sm text-gray-500 mt-1">When payments are made, they will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amounts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(p => {
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{p.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="font-medium">{p.customer_name}</div>
                        {p.customer_email && (
                          <div className="text-xs text-gray-500">{p.customer_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.payment_method?.toUpperCase() || 'UPI'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {p.transaction_id ? (
                          <div className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200 break-all">
                            {p.transaction_id}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold">₹{p.total_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Paid:</span>
                            <span className={`font-semibold ${
                              p.calculated_paid_amount === p.total_amount 
                                ? 'text-green-600' 
                                : p.calculated_paid_amount > 0 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`}>
                              ₹{p.calculated_paid_amount.toFixed(2)}
                              {p.calculated_paid_amount > 0 && (
                                <span className="ml-1 text-xs">
                                  ({((p.calculated_paid_amount / p.total_amount) * 100).toFixed(0)}%)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Due:</span>
                            <span className={`font-semibold ${
                              p.remaining_amount === 0 
                                ? 'text-green-600' 
                                : 'text-orange-600'
                            }`}>
                              ₹{p.remaining_amount.toFixed(2)}
                            </span>
                          </div>
                          
                          {/* Show payment status badges */}
                          <div className="mt-2 space-y-1">
                            <div className="text-xs">
                              <span className="text-gray-500">Advance: </span>
                              <span className={`font-semibold ${
                                p.status === 'approved' ? 'text-green-600' : 
                                p.status === 'pending' ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {p.status?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-500">Balance: </span>
                              <span className={`font-semibold ${
                                p.due_payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {p.due_payment_status === 'paid' ? 'PAID' : 'PENDING'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            p.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : p.status === 'rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {p.status === 'approved' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {p.status === 'pending' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {p.status === 'rejected' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                            {p.status?.toUpperCase()}
                          </span>
                          
                          {/* Status Management Buttons (shown inline for pending payments) */}
                          {p.status === 'pending' && (
                            <div className="ml-3 flex space-x-1">
                              <button
                                onClick={() => updatePaymentStatus(p.id, 'approved')}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                title="Approve Payment"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(p.id, 'rejected')}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                                title="Reject Payment"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewInvoice(
                              p.booking_id || p.id,
                              p.customer_name,
                              p.calculated_paid_amount,
                              p.total_amount,
                              p.status
                            )}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Invoice
                          </button>
                          <button
                            onClick={() => viewQuotation(
                              p.booking_id || p.id,
                              p.customer_name,
                              p.total_amount,
                              p.cleaning_type,
                              p.hours
                            )}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Quotation
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Payments</div>
                <div className="font-semibold text-gray-800">{payments.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Collected</div>
                <div className="font-semibold text-green-600">
                  ₹{payments
                    .filter(p => p.status === 'approved')
                    .reduce((sum, p) => sum + p.calculated_paid_amount, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Pending Approvals</div>
                <div className="font-semibold text-yellow-600">
                  {payments.filter(p => p.status === 'pending').length}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Total Outstanding</div>
                <div className="font-semibold text-orange-600">
                  ₹{payments
                    .reduce((sum, p) => sum + p.remaining_amount, 0)
                    .toFixed(2)}
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
