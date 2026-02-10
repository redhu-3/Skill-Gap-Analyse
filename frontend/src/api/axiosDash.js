import axios from "axios";

// Get token from localStorage (or wherever you store after login)
const token = localStorage.getItem("token");

const axiosDash = axios.create({
  baseURL: "http://localhost:5000/api/job-roles", // matches backend
  headers: {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  },
});

export default axiosDash;
