import React from 'react';
import { Outlet } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-100 overflow-hidden font-sans">
      <Navbar />
      
      {/* This is where your page components (like Home) will render */}
      <main>
        <Outlet />
      </main>

      {/* Floating Action Buttons - Kept in layout so they persist across all public pages */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
          <MessageCircle size={24} />
        </button>
        <button className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
          <Phone size={24} />
        </button>
      </div>
    </div>
  );
}