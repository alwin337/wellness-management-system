import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
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
            to="/Resources"
            className="
              flex
              items-center
              gap-1
              hover:text-[#7cb342]
              transition-colors
            "
          >
            Resources
            <span className="text-xs">▼</span>
          </Link>

          <Link
            to="/concerns"
            className="
              flex
              items-center
              gap-1
              hover:text-[#7cb342]
              transition-colors
            "
          >
            Concerns
            <span className="text-xs">▼</span>
          </Link>

          <Link
            to="/careers"
            className="hover:text-[#7cb342] transition-colors"
          >
            Careers
          </Link>
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
              to="/services"
              onClick={closeMenu}
              className="
                px-5
                py-4
                flex
                justify-between
                items-center
                hover:bg-[#e9eddf]
                hover:text-[#7cb342]
                transition-colors
              "
            >
              Services

              <span className="text-xs">
                ▼
              </span>
            </Link>


            <Link
              to="/concerns"
              onClick={closeMenu}
              className="
                px-5
                py-4
                flex
                justify-between
                items-center
                hover:bg-[#e9eddf]
                hover:text-[#7cb342]
                transition-colors
              "
            >
              Concerns

              <span className="text-xs">
                ▼
              </span>
            </Link>


            <Link
              to="/careers"
              onClick={closeMenu}
              className="
                px-5
                py-4
                hover:bg-[#e9eddf]
                hover:text-[#7cb342]
                transition-colors
              "
            >
              Careers
            </Link>
          </div>
        </div>
      )}

    </nav>
  );
}