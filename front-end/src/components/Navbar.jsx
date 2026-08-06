import React from 'react';

export default function Navbar() {
  return (
    <nav className="absolute top-0 w-full flex justify-between items-center px-8 py-6 z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-yellow-500 font-bold text-xl">o</span>
        </div>
        <span className="text-white font-semibold text-2xl tracking-wide">oppam</span>
      </div>
      
      <div className="hidden md:flex gap-8 text-white/90 font-medium">
        <a href="#" className="hover:text-white transition-colors">About Us</a>
        <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
          Services <span className="text-xs">▼</span>
        </a>
        <a href="#" className="hover:text-white transition-colors">Concerns</a>
        <a href="#" className="hover:text-white transition-colors">Careers</a>
      </div>

      <button className="text-white font-medium hover:text-white/80 transition-colors">
        Log In
      </button>
    </nav>
  );
}