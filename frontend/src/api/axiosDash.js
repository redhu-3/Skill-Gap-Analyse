// import axios from "axios";

// // Get token from localStorage (or wherever you store after login)
// const token = localStorage.getItem("token");

// const axiosDash = axios.create({
//   baseURL: "https://skill-gap-analyse.onrender.com/api/job-roles",
// // matches backend
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: token ? `Bearer ${token}` : "",
//   },
// });

// export default axiosDash;
import axios from "axios";

const axiosDash = axios.create({
  baseURL: "https://skill-gap-analyse.onrender.com/api/job-roles",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // important if backend uses cookies
});

// 🔐 Attach JWT token dynamically before every request
axiosDash.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosDash;
