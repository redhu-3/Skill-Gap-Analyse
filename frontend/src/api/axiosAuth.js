// axiosAuth.js
import axios from "axios";

const axiosAuth = axios.create({
  baseURL: "http://localhost:5000/auth",
  withCredentials: true,
});

export default axiosAuth;
