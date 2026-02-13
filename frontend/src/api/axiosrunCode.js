import axios from "axios";

const runCode = async (codeData) => {
  const token = localStorage.getItem("token"); // JWT token

  try {
    const response = await axios.post(
      "https://skill-gap-analyse.onrender.com/api/code/run",
      codeData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // important if backend uses cookies
      }
    );

    return response.data; // ✅ return data to frontend
  } catch (error) {
    console.error("Code run error:", error.response?.data || error.message);
    throw error; // ✅ throw error so frontend catch works
  }
};

export default runCode;
