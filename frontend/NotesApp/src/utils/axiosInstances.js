import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // Replace with your actual API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the authorization token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
