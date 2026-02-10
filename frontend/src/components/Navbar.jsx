import React from "react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <h1 className="text-2xl font-bold text-indigo-600">
            Skill DNA
          </h1>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <li className="hover:text-indigo-600 cursor-pointer">Home</li>
            <li className="hover:text-indigo-600 cursor-pointer">Features</li>
            <li className="hover:text-indigo-600 cursor-pointer">About</li>
            <li className="hover:text-indigo-600 cursor-pointer">Contact</li>
          </ul>

          {/* Actions */}
          <div className="hidden md:flex space-x-3">
            <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
              Login
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button className="text-2xl text-gray-700">
              ☰
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
