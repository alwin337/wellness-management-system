import React from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <>
      {/* Illustrated Landscape */}
      <div className="absolute bottom-0 w-full h-[50vh] pointer-events-none z-10 flex flex-col justify-end overflow-hidden">
        
        {/* Animated Sun */}
        <motion.div 
          initial={{ y: 300 }} 
          animate={{ y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute bottom-12 left-[10%] md:left-1/4 w-64 h-64 bg-white rounded-full flex items-center justify-center z-0 shadow-lg"
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
        <div className="relative w-full h-32 bg-[#8bc34a] border-t-8 border-[#7cb342] z-10 flex items-end justify-between px-10">
            {/* Left Tree */}
            <div className="w-20 h-40 bg-green-800 rounded-t-full mb-8 ml-10"></div>
            
            {/* Tent Placeholder */}
            <div className="w-40 h-32 bg-yellow-500 mb-[-2px] mr-20 border-b-8 border-yellow-600" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
            
            {/* Right Tree */}
            <div className="w-32 h-48 bg-green-700 rounded-t-full mb-8 mr-10"></div>
        </div>
      </div>
    </>
  );
}