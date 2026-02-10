// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../../api/axiosInstance";
// import { useTheme } from "../../context/ThemeContext";
// import { FaSearch, FaBriefcase } from "react-icons/fa";

// /* ===== Framer Motion Variants (FIXED) ===== */

// const pageContainer = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1 }
// };

// const headerItem = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0 }
// };

// const gridContainer = {
//   hidden: {},
//   show: {
//     transition: { staggerChildren: 0.12 }
//   }
// };

// const cardItem = {
//   hidden: { opacity: 0, y: 25 },
//   show: { opacity: 1, y: 0 }
// };

// const JobRoles = () => {
//   const { darkMode } = useTheme();
//   const navigate = useNavigate();

//   const [roles, setRoles] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const res = await axiosInstance.get("/job-roles/published");
//         console.log("Roles fetched from backend:", res.data.roles);

//         if (res.data && Array.isArray(res.data.roles)) {
//           setRoles(res.data.roles);
//         } else {
//           setRoles([]);
//         }
//       } catch (err) {
//         console.error("Error fetching roles:", err.response || err);
//         setError("Failed to load job roles. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRoles();
//   }, []);

//   const filteredRoles =
//     search.trim() === ""
//       ? roles
//       : roles.filter((role) =>
//           role.name.toLowerCase().includes(search.toLowerCase())
//         );

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-500 ${
//         darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
//       }`}
//     >
//       <motion.div
//         variants={pageContainer}
//         initial="hidden"
//         animate="show"
//         className="max-w-7xl mx-auto px-6 py-12"
//       >
//         {/* HEADER */}
//         <motion.div variants={headerItem} className="mb-10">
//           <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
//             Explore Job Roles 🚀
//           </h1>
//           <p className="text-lg opacity-70 max-w-2xl">
//             Choose a career path and start tracking your skills, roadmap, and
//             progress.
//           </p>
//         </motion.div>

//         {/* SEARCH BAR */}
//         <motion.div
//           variants={headerItem}
//           className={`flex items-center gap-3 mb-12 px-5 py-4 rounded-2xl border shadow-sm ${
//             darkMode
//               ? "bg-gray-800 border-gray-700"
//               : "bg-gray-50 border-gray-200"
//           }`}
//         >
//           <FaSearch className="opacity-60" />
//           <input
//             type="text"
//             placeholder="Search job roles..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className={`w-full bg-transparent outline-none text-lg ${
//               darkMode ? "placeholder-gray-400" : "placeholder-gray-500"
//             }`}
//           />
//         </motion.div>

//         {/* ERROR */}
//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         {/* JOB ROLES GRID */}
//         {loading ? (
//           <p className="opacity-70">Loading job roles...</p>
//         ) : filteredRoles.length === 0 ? (
//           <p className="opacity-70">
//             {search.trim() === ""
//               ? "No job roles available."
//               : "No roles match your search."}
//           </p>
//         ) : (
//           <motion.div
//             variants={gridContainer}
//             initial="hidden"
//             animate="show"
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
//           >
//             {filteredRoles.map((role) => (
//               <motion.div
//                 key={role._id}
//                 variants={cardItem}
//                 whileHover={{ y: -6 }}
//                 onClick={() => navigate(`/user/job-roles/${role._id}`)}
//                 className={`cursor-pointer rounded-3xl p-6 md:p-8 border shadow-md transition ${
//                   darkMode
//                     ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
//                     : "bg-white border-gray-200 hover:bg-gray-50"
//                 }`}
//               >
//                 <div className="flex items-center gap-4 mb-4">
//                   <div className="p-3 rounded-xl bg-indigo-600 text-white">
//                     <FaBriefcase size={20} />
//                   </div>
//                   <h3 className="text-xl font-semibold">{role.name}</h3>
//                 </div>

//                 <p className="opacity-70">{role.description}</p>

//                <div
//   onClick={() => navigate(`/user/job-roles/${role._id}`)}
//   className="mt-6 text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
// >
//   View Roadmap →
// </div>

//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default JobRoles;
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { FaSearch, FaBriefcase } from "react-icons/fa";

/* ===== Framer Motion Variants ===== */

const pageContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
};

const headerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const gridContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 }
  }
};

const cardItem = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 }
};

const JobRoles = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axiosInstance.get("/job-roles/published");

        if (res.data && Array.isArray(res.data.roles)) {
          setRoles(res.data.roles);
        } else {
          setRoles([]);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to load job roles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const filteredRoles =
    search.trim() === ""
      ? roles
      : roles.filter((role) =>
          role.name.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      <motion.div
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 py-12"
      >
        {/* HEADER */}
        <motion.div variants={headerItem} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Explore Job Roles 🚀
          </h1>
          <p className="text-lg opacity-70 max-w-2xl">
            Choose a career path and start tracking your skills, roadmap, and
            progress.
          </p>
        </motion.div>

        {/* SEARCH BAR */}
        <motion.div
          variants={headerItem}
          className={`flex items-center gap-3 mb-12 px-5 py-4 rounded-2xl border shadow-sm ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <FaSearch className="opacity-60" />
          <input
            type="text"
            placeholder="Search job roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-transparent outline-none text-lg ${
              darkMode ? "placeholder-gray-400" : "placeholder-gray-500"
            }`}
          />
        </motion.div>

        {/* ERROR */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* JOB ROLES GRID */}
        {loading ? (
          <p className="opacity-70">Loading job roles...</p>
        ) : filteredRoles.length === 0 ? (
          <p className="opacity-70">
            {search.trim() === ""
              ? "No job roles available."
              : "No roles match your search."}
          </p>
        ) : (
          <motion.div
            variants={gridContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredRoles.map((role) => (
              <motion.div
                key={role._id}
                variants={cardItem}
                whileHover={{ y: -6 }}
                className={`rounded-3xl p-6 md:p-8 border shadow-md transition ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-indigo-600 text-white">
                    <FaBriefcase size={20} />
                  </div>
                  <h3 className="text-xl font-semibold">{role.name}</h3>
                </div>

                <p className="opacity-70">{role.description}</p>

                {/* ✅ CORRECT NAVIGATION */}
                <div
                  onClick={() =>
                    navigate(`/user/roadmap/${role._id}`)
                  }
                  className="mt-6 text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
                >
                  View Roadmap →
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default JobRoles;
