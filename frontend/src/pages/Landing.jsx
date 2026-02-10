// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaMoon, FaSun } from "react-icons/fa";
// import { useTheme } from "../context/ThemeContext"; 

// import img1 from "../assets/img 1.jpg";
// import img2 from "../assets/img2.jpeg";
// import img4 from "../assets/img3.jpeg";

// const images = [img1, img2, img4];

// const Landing = () => {
//   const navigate = useNavigate();

//   // ---------------- THEME ----------------
//   // const [darkMode, setDarkMode] = useState(false);

//   // useEffect(() => {
//   //   const savedTheme = localStorage.getItem("darkMode");
//   //   if (savedTheme) setDarkMode(savedTheme === "true");
//   // }, []);

//   // const toggleTheme = () => {
//   //   setDarkMode(!darkMode);
//   //   localStorage.setItem("darkMode", !darkMode);
//   // };
//    const { darkMode, toggleTheme } = useTheme(); // ✅ get theme from conte

//   // ---------------- IMAGE SLIDER ----------------
//   const [currentImage, setCurrentImage] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImage((prev) => (prev + 1) % images.length);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-500 ${
//         darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
//       }`}
//     >
//       {/* ---------------- NAVBAR ---------------- */}
//       <nav
//         className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-4 flex items-center justify-between transition-colors ${
//           darkMode ? "bg-gray-900 shadow-lg" : "bg-white shadow-md"
//         }`}
//       >
//         <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//           Skill DNA
//         </h1>

//         <div className="flex items-center gap-4">
//           <button onClick={toggleTheme} className="text-xl">
//             {darkMode ? <FaSun /> : <FaMoon />}
//           </button>

//           <button
//             onClick={() => navigate("/login")}
//             className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
//           >
//             Login
//           </button>

//           <button
//             onClick={() => navigate("/login")}
//             className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
//           >
//             Sign Up
//           </button>
//         </div>
//       </nav>

//       {/* ---------------- HERO SECTION ---------------- */}
//       <section className="pt-28 min-h-screen flex items-center">
//         <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
//           {/* LEFT CONTENT */}
//           <div className="relative z-10">
//             {/* Blur background */}
//             <div
//               className={`absolute -inset-6 rounded-3xl blur-3xl opacity-30 ${
//                 darkMode ? "bg-indigo-900" : "bg-indigo-200"
//               }`}
//             />

//             <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
//               Know Your Skills.{" "}
//               <span className="text-indigo-600 dark:text-indigo-400">
//                 Unlock Your Career.
//               </span>
//             </h2>

//             <p className="relative mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
//               Skill DNA helps you analyze skill gaps, track progress, and build
//               a personalized learning roadmap to achieve your career goals.
//             </p>

//             <div className="relative mt-8 flex gap-4">
//               <button
//                 onClick={() => navigate("/login")}
//                 className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
//               >
//                 Get Started
//               </button>

//               <button
//                 onClick={() => navigate("/login")}
//                 className="px-8 py-4 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
//               >
//                 Take a Tour
//               </button>
//             </div>
//           </div>

//           {/* RIGHT IMAGE SLIDER */}
//           <div className="hidden md:block absolute top-0 right-0 h-screen w-[55%]">
// <div className="hidden md:block absolute top-[80px] right-0 h-[calc(100vh-80px)]  w-[60%] xl:w-[65%] 2xl:w-[70%]">
//   <img
//     src={images[currentImage]}
//     alt="Skill DNA"
//     className="
//       h-full w-full
//       object-cover
//       ml-auto
      
//       [mask-image:linear-gradient(to_left,black_60%,transparent_100%)]
//       [-webkit-mask-image:linear-gradient(to_left,black_60%,transparent_100%)]
//       transition-opacity duration-700
//     "
//   />
// </div>
// </div>

//         </div>
//       </section>

//       {/* ---------------- FOOTER ---------------- */}
//       <footer
//         className={`mt-20 py-6 text-center transition-colors ${
//           darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
//         }`}
//       >
//         © 2026 Skill DNA. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default Landing;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

import Features from "../components/Features";
import HowItWorks from "../components/Howitworks";

import img1 from "../assets/img 1.jpg";
import img2 from "../assets/img2.jpeg";
import img4 from "../assets/img3.jpeg";

const images = [img1, img2, img4];

const Landing = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 smooth scroll helper
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      {/* ---------------- NAVBAR ---------------- */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-4 flex items-center justify-between transition-colors ${
          darkMode ? "bg-gray-900 shadow-lg" : "bg-white shadow-md"
        }`}
      >
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Skill Map
        </h1>

        {/* 🔹 CENTER NAV LINKS */}
        <div className="hidden md:flex gap-8 font-medium">
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            How It Works
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-xl">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            onClick={() => navigate("/login",{state:{defaultTab: "login"}})}
            className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/login",{state:{defaultTab:"signup"}})}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* ---------------- HERO SECTION (UNCHANGED) ---------------- */}
      <section className="pt-28 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="relative z-10">
            <div
              className={`absolute -inset-6 rounded-3xl blur-3xl opacity-30 ${
                darkMode ? "bg-indigo-900" : "bg-indigo-200"
              }`}
            />

            <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Know Your Skills.{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Unlock Your Career.
              </span>
            </h2>

            <p className="relative mt-6 text-lg text-gray-700 dark:text-gray-500 max-w-xl">
              Skill DNA helps you analyze skill gaps, track progress, and build
              a personalized learning roadmap to achieve your career goals.
            </p>

            <div className="relative mt-8 flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-8 py-4 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
              >
                Take a Tour
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE SLIDER (UNCHANGED) */}
          <div className="hidden md:block absolute top-0 right-0 h-screen w-[55%]">
            <div className="absolute top-[80px] right-0 h-[calc(100vh-80px)] w-[60%] xl:w-[65%] 2xl:w-[70%]">
              <img
                src={images[currentImage]}
                alt="Skill DNA"
                className="
                  h-full w-full
                  object-cover
                  ml-auto
                  [mask-image:linear-gradient(to_left,black_60%,transparent_100%)]
                  [-webkit-mask-image:linear-gradient(to_left,black_60%,transparent_100%)]
                  transition-opacity duration-700
                "
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES SECTION ---------------- */}
      <section id="features">
        <Features />
      </section>

      {/* ---------------- HOW IT WORKS SECTION ---------------- */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer
        className={`mt-20 py-6 text-center transition-colors ${
          darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
        }`}
      >
        © 2026 Skill DNA. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;

