import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "qrcode";
import axios from "axios";
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import logo from "../assets/logo.png";

const API_URL = "https://splash-shine-api.onrender.com";

// OWNER PAYMENT DETAILS
const OWNER_UPI_ID = "mohammedshayshadbangson-3@okhdfcbank";

// BANK DETAILS
const BANK_DETAILS = {
  accountName: "SPLASH SHINE SOLUTIONS",
  accountNumber: "0432202600000201",
  ifscCode: "KARB0000432",
  bankName: "KARNATAKA BANK",
  branch: "KANHANGAD"
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const bookingData = location.state || {};
  const {
    bookingId = "N/A",
    customerName = "N/A",
    mobile = "N/A",
    cleaningType = "N/A",
    hours = 0,
    totalPrice = 0,
    address = "N/A",
    bookingDate = new Date().toISOString().split('T')[0],
    services = []
  } = bookingData;

  const totalWithGST = Number(totalPrice) || 0;
  const taxableAmount = Number((totalWithGST / 1.18).toFixed(2));
  const gstAmount = Number((totalWithGST - taxableAmount).toFixed(2));
  const advancePayment = Number((totalWithGST * 0.5).toFixed(2));
  const remainingPayment = Number((totalWithGST * 0.5).toFixed(2));

  const generateInvoicePDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'PNG', 15, 10, 30, 30);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('SPLASH SHINE SOLUTION', 50, 20);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Professional Cleaning Services', 50, 27);
    doc.text('Phone: +91-8137070424 | Email: info@splashshine.com', 50, 33);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 105, 58, { align: 'center' });
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 65, 180, 25, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, 65, 180, 25);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice Details', 20, 72);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(`Invoice No: INV${bookingId}${Date.now().toString().slice(-4)}`, 20, 78);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 83);
    doc.text(`Booking ID: #${bookingId}`, 20, 88);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Status', 120, 72);
    doc.setFont(undefined, 'normal');
    doc.text(`Status: Payment Verified`, 120, 78);
    doc.text(`Method: ${paymentMethod === "upi" ? "UPI" : "Bank Transfer"}`, 120, 83);
    doc.text(`Booking Date: ${bookingDate}`, 120, 88);
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 95, 85, 30, 'F');
    doc.rect(15, 95, 85, 30);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('BILL TO:', 20, 102);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`${customerName}`, 20, 109);
    doc.setFontSize(8);
    doc.text(`Mobile: ${mobile}`, 20, 115);
    const addressLines = doc.splitTextToSize(address, 75);
    doc.text(addressLines, 20, 121);
    doc.setFillColor(245, 247, 250);
    doc.rect(110, 95, 85, 30, 'F');
    doc.rect(110, 95, 85, 30);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('SERVICE INFO:', 115, 102);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(`Service: ${cleaningType}`, 115, 109);
    doc.text(`Duration: ${hours} hour(s)`, 115, 115);
    doc.text(`Service Date: ${bookingDate}`, 115, 121);
    let yPos = 135;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('PAYMENT BREAKDOWN', 15, yPos);
    yPos += 7;
    doc.setFillColor(37, 99, 235);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Description', 20, yPos + 5);
    doc.text('Amount', 175, yPos + 5, { align: 'right' });
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.rect(15, yPos, 180, 8);
    doc.text('Service Charges', 20, yPos + 5);
    doc.text('Rs. ' + taxableAmount.toFixed(2), 175, yPos + 5, { align: 'right' });
    yPos += 8;
    doc.rect(15, yPos, 180, 8);
    doc.text('GST (18%)', 20, yPos + 5);
    doc.text('Rs. ' + gstAmount.toFixed(2), 175, yPos + 5, { align: 'right' });
    yPos += 8;
    doc.setFillColor(220, 252, 231);
    doc.rect(15, yPos, 180, 10, 'F');
    doc.rect(15, yPos, 180, 10);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL AMOUNT (Including GST)', 20, yPos + 7);
    doc.text('Rs. ' + totalWithGST.toFixed(2), 175, yPos + 7, { align: 'right' });
    yPos += 10;
    doc.setFillColor(255, 243, 224);
    doc.rect(15, yPos, 180, 15, 'F');
    doc.rect(15, yPos, 180, 15);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('Advance Paid (50%)', 20, yPos + 6);
    doc.text('Rs. ' + advancePayment.toFixed(2), 175, yPos + 6, { align: 'right' });
    doc.text('Remaining Balance (50%)', 20, yPos + 11);
    doc.text('Rs. ' + remainingPayment.toFixed(2), 175, yPos + 11, { align: 'right' });
    yPos = 270;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, 195, yPos);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Thank you for choosing Splash Shine Solution!', 105, yPos + 6, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Terms & Conditions: Payment is non-refundable. Service may be rescheduled with 24hr notice.', 105, yPos + 12, { align: 'center' });
    doc.text('All prices are inclusive of applicable taxes.', 105, yPos + 17, { align: 'center' });
    doc.save(`Invoice_${bookingId}_${Date.now()}.pdf`);
  };

  const generateQuotationPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'PNG', 15, 10, 30, 30);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('SPLASH SHINE SOLUTION', 50, 20);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Professional Cleaning Services', 50, 27);
    doc.text('Phone: +91-8137070424 | Email: info@splashshine.com', 50, 33);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('QUOTATION', 105, 58, { align: 'center' });
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 65, 180, 20, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, 65, 180, 20);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Quotation No: QUO${bookingId}${Date.now().toString().slice(-4)}`, 20, 72);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 78);
    doc.text(`Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-IN')}`, 120, 72);
    doc.text(`Booking Ref: #${bookingId}`, 120, 78);
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 90, 180, 25, 'F');
    doc.rect(15, 90, 180, 25);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('CUSTOMER DETAILS:', 20, 97);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${customerName}`, 20, 104);
    doc.text(`Mobile: ${mobile}`, 20, 110);
    const addressLines = doc.splitTextToSize(`Address: ${address}`, 170);
    doc.text(addressLines, 20, 116);
    let yPos = 125;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('REQUESTED SERVICES', 15, yPos);
    yPos += 7;
    doc.setFillColor(16, 185, 129);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Service Description', 20, yPos + 5);
    doc.text('Details', 120, yPos + 5);
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    if (services && services.length > 0) {
      services.forEach((service) => {
        const rowHeight = 8;
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.rect(15, yPos, 180, rowHeight);
        const serviceLines = doc.splitTextToSize(service, 90);
        doc.text(serviceLines, 20, yPos + 5);
        doc.text('Included', 120, yPos + 5);
        yPos += rowHeight;
      });
    } else {
      doc.rect(15, yPos, 180, 7);
      doc.text('No services specified', 20, yPos + 5);
      yPos += 7;
    }
    yPos += 5;
    doc.setFillColor(245, 247, 250);
    doc.rect(15, yPos, 180, 20, 'F');
    doc.rect(15, yPos, 180, 20);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('SERVICE SUMMARY:', 20, yPos + 7);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(`Service Type: ${cleaningType}`, 20, yPos + 13);
    doc.text(`Duration: ${hours} hour(s)`, 90, yPos + 13);
    doc.text(`Proposed Date: ${bookingDate}`, 140, yPos + 13);
    yPos += 25;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('PRICE BREAKDOWN', 15, yPos);
    yPos += 7;
    doc.setFillColor(16, 185, 129);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Description', 20, yPos + 5);
    doc.text('Hours', 120, yPos + 5);
    doc.text('Amount', 175, yPos + 5, { align: 'right' });
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.rect(15, yPos, 180, 8);
    doc.text(`${cleaningType} Service`, 20, yPos + 5);
    doc.text(`${hours}`, 120, yPos + 5);
    doc.text('Rs. ' + taxableAmount.toFixed(2), 175, yPos + 5, { align: 'right' });
    yPos += 8;
    doc.setFillColor(245, 247, 250);
    doc.rect(15, yPos, 180, 7, 'F');
    doc.rect(15, yPos, 180, 7);
    doc.setFont(undefined, 'bold');
    doc.text('Taxable Amount', 20, yPos + 5);
    doc.text('Rs. ' + taxableAmount.toFixed(2), 175, yPos + 5, { align: 'right' });
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.rect(15, yPos, 180, 7);
    doc.text('Tax Value - GST (18%)', 20, yPos + 5);
    doc.text('Rs. ' + gstAmount.toFixed(2), 175, yPos + 5, { align: 'right' });
    yPos += 7;
    doc.setFillColor(220, 252, 231);
    doc.rect(15, yPos, 180, 10, 'F');
    doc.rect(15, yPos, 180, 10);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL QUOTED AMOUNT', 20, yPos + 7);
    doc.text('Rs. ' + totalWithGST.toFixed(2), 175, yPos + 7, { align: 'right' });
    yPos += 15;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('IMPORTANT NOTES:', 15, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    yPos += 6;
    doc.text('• This quotation is valid for 30 days from the date of issue', 15, yPos); yPos += 5;
    doc.text('• 50% advance payment required, remaining 50% due on service completion', 15, yPos); yPos += 5;
    doc.text('• All prices are inclusive of 18% GST', 15, yPos); yPos += 5;
    doc.text('• Prices may vary based on actual site conditions', 15, yPos);
    yPos = 270;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, 195, yPos);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('We look forward to serving you!', 105, yPos + 6, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('For any queries, please contact us at +91-8137070424 or info@splashshine.com', 105, yPos + 12, { align: 'center' });
    doc.save(`Quotation_${bookingId}_${Date.now()}.pdf`);
  };

  const submitPaymentToBackend = async () => {
    try {
      const formData = new FormData();
      formData.append('booking_id', bookingId);
      formData.append('payment_method', paymentMethod);
      formData.append('amount', advancePayment);
      formData.append('customer_upi_id', '');

      const response = await axios.post(`${API_URL}/confirm-payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data ? true : false;
    } catch (error) {
      console.error('Error submitting payment:', error);
      throw error;
    }
  };

  const handleUpiPayment = async () => {
    const upiString = `upi://pay?pa=${OWNER_UPI_ID}&pn=SplashShine&am=${advancePayment}&cu=INR&tn=Booking${bookingId}`;
    try {
      const qrCode = await QRCode.toDataURL(upiString, { width: 300 });
      setQrCodeDataUrl(qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to generate QR code. Please try again.', confirmButtonColor: '#ef4444' });
    }
  };

  const handlePaymentConfirmation = async () => {
    if (paymentMethod === "upi" && !qrCodeDataUrl) return;

    const confirm = await Swal.fire({
      title: 'Confirm Payment?',
      text: `Confirm advance payment of ₹${advancePayment.toFixed(2)}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Confirm!',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      await submitPaymentToBackend();
      setLoading(false);
      setPaymentSuccess(true);
      Swal.fire({
        icon: 'success',
        title: 'Payment Confirmed!',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 18px; margin: 10px 0;">Advance payment of <strong>₹${advancePayment.toFixed(2)}</strong> confirmed!</p>
            <p style="color: #666; margin: 10px 0;">Booking ID: <strong>#${bookingId}</strong></p>
            <p style="color: #f97316; margin: 10px 0;">Remaining Balance: <strong>₹${remainingPayment.toFixed(2)}</strong></p>
            <p style="font-size: 14px; color: #888; margin-top: 15px;">Please download your invoice and quotation</p>
          </div>
        `,
        confirmButtonText: 'Download Documents',
        confirmButtonColor: '#10b981',
        allowOutsideClick: false
      });
    } catch (error) {
      setLoading(false);
      Swal.fire({ icon: 'error', title: 'Payment Failed', text: 'Failed to submit payment. Please try again.', confirmButtonColor: '#ef4444' });
    }
  };

  if (!location.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Booking Found</h2>
          <p className="text-gray-600 mb-6">Please make a booking first before accessing payment.</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">50% Advance Payment - Remaining balance due on service completion</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-semibold text-gray-800">#{bookingId}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-semibold text-gray-800">{customerName}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Mobile:</span>
                <span className="font-semibold text-gray-800">{mobile}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Cleaning Type:</span>
                <span className="font-semibold text-gray-800 capitalize">{cleaningType}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-800">{hours} hour(s)</span>
              </div>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mt-4 space-y-3">
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-sm text-gray-700">Taxable Amount:</span>
                  <span className="text-sm font-semibold text-gray-800">₹{taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-sm text-gray-700">Tax Value (GST 18%):</span>
                  <span className="text-sm font-semibold text-gray-800">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-sm font-bold text-gray-800">Total:</span>
                  <span className="text-sm font-bold text-gray-800">₹{totalWithGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-lg font-bold text-blue-800">Pay Now (50% Advance):</span>
                  <span className="text-2xl font-bold text-blue-600">₹{advancePayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-blue-200 pt-2">
                  <span className="text-sm text-gray-600">Remaining Balance:</span>
                  <span className="text-sm font-semibold text-orange-600">₹{remainingPayment.toFixed(2)}</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                  <p className="text-xs text-yellow-800">💡 Remaining 50% due upon service completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Options</h2>

            {!paymentSuccess ? (
              <div className="space-y-4">
                {/* Payment Method Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${paymentMethod === "upi" ? "bg-blue-600 text-white shadow-md" : "bg-transparent text-gray-600 hover:text-gray-800"}`}
                  >
                    UPI Payment
                  </button>
                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${paymentMethod === "bank" ? "bg-blue-600 text-white shadow-md" : "bg-transparent text-gray-600 hover:text-gray-800"}`}
                  >
                    Bank Transfer
                  </button>
                </div>

                {/* UPI Payment Section */}
                {paymentMethod === "upi" && (
                  <>
                    <div className="bg-blue-50 border-2 border-blue-500 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">Pay via UPI</span>
                      </div>
                      <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm, BHIM</p>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>1. Generate QR Code</p>
                        <p>2. Scan with any UPI app</p>
                        <p>3. Complete payment</p>
                        <p>4. Click Confirm Payment</p>
                      </div>
                    </div>

                    <button
                      onClick={handleUpiPayment}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                    >
                      Generate QR Code to Pay
                    </button>

                    {qrCodeDataUrl && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-300 text-center">
                        <p className="font-bold text-gray-800 mb-3">📱 Scan QR Code to Pay</p>
                        <img src={qrCodeDataUrl} alt="UPI QR Code" className="mx-auto mb-3 border-4 border-gray-200 rounded-lg" />
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-semibold text-blue-800">Amount to Pay: ₹{advancePayment.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">(50% Advance of ₹{totalWithGST.toFixed(2)})</p>
                        </div>
                        <p className="text-xs text-gray-500">Scan with Google Pay, PhonePe, Paytm, or any UPI app</p>
                      </div>
                    )}
                  </>
                )}

                {/* Bank Transfer Section */}
                {paymentMethod === "bank" && (
                  <div className="bg-green-50 border-2 border-green-500 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-gray-800">Direct Bank Transfer</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Transfer to the following account:</p>
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Account Name:</span>
                        <span className="text-sm font-bold text-gray-800">{BANK_DETAILS.accountName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Account Number:</span>
                        <span className="text-sm font-mono font-bold text-gray-800">{BANK_DETAILS.accountNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">IFSC Code:</span>
                        <span className="text-sm font-mono font-bold text-gray-800">{BANK_DETAILS.ifscCode}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Bank:</span>
                        <span className="text-sm font-semibold text-gray-800">{BANK_DETAILS.bankName}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Branch:</span>
                        <span className="text-sm font-semibold text-gray-800">{BANK_DETAILS.branch}</span>
                      </div>
                    </div>
                    <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded p-3">
                      <p className="text-xs text-yellow-800">💡 <strong>Amount to Transfer:</strong> ₹{advancePayment.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => navigate("/")}
                    className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handlePaymentConfirmation}
                    disabled={loading || (paymentMethod === "upi" && !qrCodeDataUrl)}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Confirm Payment"}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    {paymentMethod === "upi"
                      ? "💡 After scanning and paying, click \"Confirm Payment\""
                      : "💡 After completing bank transfer, click \"Confirm Payment\""
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">✅ Payment Confirmed!</h3>
                  <div className="bg-white p-3 rounded-lg inline-block mb-3">
                    <p className="text-lg font-semibold text-green-700">Advance Paid: ₹{advancePayment.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="text-gray-600">Total: ₹{totalWithGST.toFixed(2)}</span>
                    <span className="text-orange-600">Remaining: ₹{remainingPayment.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-center text-gray-600">Your booking is confirmed! Please download your documents.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={generateInvoicePDF}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
                    >
                      Download Invoice
                    </button>
                    <button
                      onClick={generateQuotationPDF}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md"
                    >
                      Download Quotation
                    </button>
                  </div>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-green-700 transition-all shadow-lg text-lg"
                  >
                    🏠 Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}