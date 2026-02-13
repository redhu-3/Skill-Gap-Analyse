import axios from "axios";

// Get token from localStorage (or wherever you store after login)
const token = localStorage.getItem("token");

const axiosDash = axios.create({
  baseURL: "https://skill-gap-analyse.onrender.com/api/job-roles", // matches backend
  headers: {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  },
});

export default axiosDash;
