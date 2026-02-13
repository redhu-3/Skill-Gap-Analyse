// axiosAuth.js
import axios from "axios";

const axiosAuth = axios.create({
  baseURL: "https://skill-gap-analyse.onrender.com/auth",
  withCredentials: true,
});

export default axiosAuth;
