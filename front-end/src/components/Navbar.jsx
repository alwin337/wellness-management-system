import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, XCircle } from "lucide-react";
import { concernsData } from "../data/concernsData";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [concernsDropdownOpen, setConcernsDropdownOpen] = useState(false);
  const [mobileConcernsOpen, setMobileConcernsOpen] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState(null);
  
  const dropdownRef = useRef(null);

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

  // Handle click outside concerns dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setConcernsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGetSupport = () => {
    setSelectedConcern(null);
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'counsellor') navigate('/counsellor');
      else navigate('/student');
    } else {
      navigate('/login');
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileConcernsOpen(false);
  };

  return (
    <nav
      className="
        absolute
        top-0
        left-0
        w-full
        z-50
        px-6
        sm:px-8
        md:px-12
        lg:px-20
        py-6
      "
    >
      <div className="flex items-center justify-between">

        {/* DESKTOP NAVIGATION */}
        <div
          className="
            hidden
            md:flex
            items-center
            gap-8
            lg:gap-10
            text-[#2f4f3e]
            font-medium
          "
        >

          <Link
            to="/"
            className="
        text-[#2f4f3e]
          font-bold
          text-xl
          lg:text-2xl
          tracking-tight
          whitespace-nowrap
          mr-4
      hover:text-[#7cb342]
        transition-colors"
          >
            Counselling <span className="text-[#7cb342]">Cell</span>
          </Link>

          <Link
            to="/about"
            className="hover:text-[#7cb342] transition-colors"
          >
            About Us
          </Link>

          <Link
            to="/resources"
            className="
              hover:text-[#7cb342]
              transition-colors
            "
          >
            Resources
          </Link>

          <div className="relative font-sans" ref={dropdownRef}>
            <button
              onClick={() => setConcernsDropdownOpen(!concernsDropdownOpen)}
              className="
                flex
                items-center
                gap-1
                hover:text-[#7cb342]
                transition-colors
                focus:outline-none
                font-medium
                cursor-pointer
              "
              aria-expanded={concernsDropdownOpen}
            >
              Concerns
              <span className="text-xs">▼</span>
            </button>

            {/* Dropdown Menu */}
            {concernsDropdownOpen && (
              <div 
                className="
                  absolute
                  top-full
                  left-0
                  mt-2
                  w-64
                  bg-[#f5f1e8]
                  border
                  border-[#dfe5d5]
                  rounded-2xl
                  shadow-xl
                  py-2
                  z-50
                  origin-top-left
                  transition-all
                  duration-200
                "
              >
                {concernsData.map((concern) => {
                  const Icon = concern.icon;
                  return (
                    <button
                      key={concern.id}
                      onClick={() => {
                        setSelectedConcern(concern);
                        setConcernsDropdownOpen(false);
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-2.5
                        text-sm
                        text-[#2f4f3e]
                        hover:bg-[#e9eddf]
                        hover:text-[#7cb342]
                        transition-colors
                        flex
                        items-center
                        gap-2.5
                        font-medium
                        cursor-pointer
                      "
                    >
                      <Icon className="w-4 h-4 text-[#7cb342]" />
                      {concern.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>


        {/* MOBILE HAMBURGER */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            md:hidden
            text-[#2f4f3e]
            hover:text-[#7cb342]
            transition-colors
          "
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>


        {/*LOGIN*/}
        <Link
          to="/login"
          className="
            text-[#2f4f3e]
            font-medium
            hover:text-[#7cb342]
            transition-colors
          "
        >
          Log In
        </Link>
      </div>


      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          className="
            md:hidden
            mt-5
            bg-[#f5f1e8]
            border
            border-[#dfe5d5]
            rounded-xl
            shadow-lg
            overflow-hidden
          "
        >
          <div
            className="
              flex
              flex-col
              text-[#2f4f3e]
              font-medium
            "
          >
            <Link
              to="/about"
              onClick={closeMenu}
              className="
                px-5
                py-4
                hover:bg-[#e9eddf]
                hover:text-[#7cb342]
                transition-colors
              "
            >
              About Us
            </Link>


            <Link
              to="/resources"
              onClick={closeMenu}
              className="
                px-5
                py-4
                hover:bg-[#e9eddf]
                hover:text-[#7cb342]
                transition-colors
              "
            >
              Resources
            </Link>


            <div className="border-b border-[#dfe5d5]/50">
              <button
                onClick={() => setMobileConcernsOpen(!mobileConcernsOpen)}
                className="
                  w-full
                  px-5
                  py-4
                  flex
                  justify-between
                  items-center
                  hover:bg-[#e9eddf]
                  hover:text-[#7cb342]
                  transition-colors
                  text-left
                  font-medium
                  cursor-pointer
                "
              >
                <span>Concerns</span>
                <span className="text-xs">{mobileConcernsOpen ? "▲" : "▼"}</span>
              </button>

              {mobileConcernsOpen && (
                <div className="bg-[#e9eddf]/50 border-t border-[#dfe5d5]/60 py-1">
                  {concernsData.map((concern) => {
                    const Icon = concern.icon;
                    return (
                      <button
                        key={concern.id}
                        onClick={() => {
                          setSelectedConcern(concern);
                          closeMenu();
                        }}
                        className="
                          w-full
                          text-left
                          pl-8
                          pr-4
                          py-3
                          text-sm
                          text-[#2f4f3e]
                          hover:bg-[#e9eddf]
                          hover:text-[#7cb342]
                          transition-colors
                          flex
                          items-center
                          gap-2.5
                          font-medium
                          cursor-pointer
                        "
                      >
                        <Icon className="w-4 h-4 text-[#7cb342]" />
                        {concern.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Concerns Detail Modal */}
      {selectedConcern && (
        <div 
          className="
            fixed 
            inset-0 
            z-[100] 
            flex 
            items-center 
            justify-center 
            p-4 
            bg-[#2f4f3e]/40 
            backdrop-blur-sm
            transition-opacity
            duration-300
          "
          onClick={() => setSelectedConcern(null)}
        >
          <div 
            className="
              bg-[#f5f1e8] 
              border-2 
              border-[#dfe5d5] 
              rounded-3xl 
              shadow-2xl 
              max-w-xl 
              w-full 
              max-h-[90vh] 
              overflow-y-auto 
              p-6 
              sm:p-8 
              space-y-6 
              relative
              scale-100
              transition-transform
              duration-300
              font-sans
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section with icon and title */}
            <div className="flex items-start justify-between border-b border-[#dfe5d5] pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#e9eddf] p-3 rounded-2xl border border-[#dfe5d5] text-[#7cb342]">
                  {React.createElement(selectedConcern.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#2f4f3e] tracking-tight">
                    {selectedConcern.title}
                  </h3>
                  <span className="text-[10px] font-bold text-[#7cb342] uppercase tracking-widest">Wellness Topic</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedConcern(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Close"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7cb342]">What is it?</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {selectedConcern.description}
              </p>
            </div>

            {/* Signs and Factors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {/* Common Signs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7cb342]">Common Signs</h4>
                <ul className="space-y-1.5">
                  {selectedConcern.signs.map((sign, idx) => (
                    <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5 leading-relaxed">
                      <span className="text-[#7cb342] font-extrabold mt-0.5">•</span>
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contributing Factors */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7cb342]">Possible Contributing Factors</h4>
                <ul className="space-y-1.5">
                  {selectedConcern.factors.map((factor, idx) => (
                    <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5 leading-relaxed">
                      <span className="text-[#7cb342] font-extrabold mt-0.5">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coping Strategies */}
            <div className="space-y-2 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7cb342]">Helpful Coping Strategies</h4>
              <ul className="space-y-1.5">
                {selectedConcern.copingStrategies.map((strategy, idx) => (
                  <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5 leading-relaxed">
                    <span className="text-[#7cb342] font-extrabold mt-0.5">•</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>

            {/* When to seek support */}
            <div className="bg-[#e9eddf]/50 border border-[#dfe5d5] rounded-2xl p-4 space-y-1.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2f4f3e]">When to seek support</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {selectedConcern.supportAdvice}
              </p>
            </div>

            {/* Bottom Actions CTA */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#dfe5d5]">
              <button 
                onClick={() => setSelectedConcern(null)}
                className="px-5 py-2.5 bg-white border border-[#dfe5d5] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition duration-200 cursor-pointer"
              >
                Close Window
              </button>
              <button 
                onClick={handleGetSupport}
                className="px-5 py-2.5 bg-[#7cb342] hover:bg-[#689f38] text-white font-bold rounded-xl text-xs shadow-md shadow-[#7cb342]/10 hover:shadow-lg hover:shadow-[#7cb342]/20 transition duration-200 cursor-pointer"
              >
                Get Support
              </button>
            </div>

          </div>
        </div>
      )}

    </nav>
  );
}