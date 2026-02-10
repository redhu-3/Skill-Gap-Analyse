// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:5000/api", // your backend URL
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default axiosInstance;


import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // for Google auth/session
});

// 🔐 Attach JWT token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
