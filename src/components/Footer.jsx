import React from "react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#004753] text-white py-8 mt-10">
      <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-3 gap-8">

        {/* Logo + About */}
        <div>
          <div className="bg-white p-2 rounded-lg inline-block mb-3 shadow-md">
            <img
              src={logo}
              className="h-12 w-auto"
              alt="Splash Shine Solution Logo"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">Splash Shine Solution</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Your trusted partner for premium cleaning, car wash, and moving services.
            We ensure quality, professionalism, and customer satisfaction.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:underline hover:text-cyan-300 transition-colors">Home</a></li>
            <li><a href="#services" className="hover:underline hover:text-cyan-300 transition-colors">Services</a></li>
            <li><a href="#about" className="hover:underline hover:text-cyan-300 transition-colors">About Us</a></li>
            <li><a href="#contact" className="hover:underline hover:text-cyan-300 transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="text-sm opacity-80 mb-2">📍 Kanhangad, Kasaragod, Kerala</p>
          <p className="text-sm opacity-80 mb-2">📞 +91 8590717424</p>
          <p className="text-sm opacity-80 mb-2">📞 +91 8137070424</p>
          <p className="text-sm opacity-80">✉️ splashshinesolutions@gmail.com</p>
        </div>

      </div>

      <div className="text-center mt-8 text-sm opacity-70">
        © {new Date().getFullYear()} Splash Shine Solution. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;