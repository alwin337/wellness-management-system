import React from 'react';
import { Outlet } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  const openWhatsApp = () => {
    const counsellorNumber = "919633883854";

    const message =
      "Hello, I am looking for counselling support. Could you please help me?";

    const whatsappUrl =
      `https://wa.me/${counsellorNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-100 overflow-hidden font-sans">
      <Navbar />

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={openWhatsApp}
          aria-label="Chat with a counsellor on WhatsApp"
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-transform"
        >
          <MessageCircle size={28} />
        </button>
      </div>
    </div>
  );
}
