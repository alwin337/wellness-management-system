import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartPulse } from 'lucide-react';

export default function Home() {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  let user = null;
  if (token && userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-32 px-6 sm:px-12 z-20">
      
      {/* Hero Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full bg-white/80 backdrop-blur-md border border-slate-200/50 p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-6 z-20 mt-12"
      >
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold tracking-wider uppercase text-xs">
          <HeartPulse className="w-5 h-5 text-emerald-500 animate-pulse" />
          Wellness & Support Portal
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Wellness Management System
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto font-medium">
          A safe, confidential space for students to seek guidance, balance academic pressures, and cultivate a healthier state of mind.
        </p>

        {/* Dynamic CTA Section */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link 
              to={
                user.role === 'admin' ? '/admin' :
                user.role === 'counsellor' ? '/counsellor' : '/student'
              }
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:translate-x-1 duration-200"
            >
              Go to Your Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link 
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-800/20 transition-all flex items-center justify-center gap-2"
              >
                Book a Session
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl text-sm font-bold transition-all text-center"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </motion.div>

      {/* Illustrated Landscape */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] sm:h-[45vh] pointer-events-none z-10 flex flex-col justify-end overflow-hidden">
        
        {/* Animated Sun */}
        <motion.div 
          initial={{ y: 300 }} 
          animate={{ y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute bottom-12 left-[10%] md:left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-full flex items-center justify-center z-0 shadow-lg"
        >
          {/* Simple Smile for the Sun */}
          <div className="flex flex-col items-center gap-2 mt-8">
            <div className="flex gap-8">
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
            </div>
            <div className="w-12 h-4 border-b-4 border-gray-800 rounded-full" />
          </div>
        </motion.div>

        {/* Foreground / Grass */}
        <div className="relative w-full h-24 bg-[#8bc34a] border-t-8 border-[#7cb342] z-10 flex items-end justify-between px-10">
            {/* Left Tree */}
            <div className="w-20 h-40 bg-green-800 rounded-t-full mb-8 ml-10"></div>
            
            {/* Tent Placeholder */}
            <div className="w-40 h-32 bg-yellow-500 mb-[-2px] mr-20 border-b-8 border-yellow-600" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
            
            {/* Right Tree */}
            <div className="w-32 h-48 bg-green-700 rounded-t-full mb-8 mr-10"></div>
        </div>
      </div>
    </div>
  );
}