import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 428) {
      // Backend indica PASSWORD_CHANGE_REQUIRED / FIRST_LOGIN_REQUIRED
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser.mustChangePassword) {
            parsedUser.mustChangePassword = true;
            localStorage.setItem("user", JSON.stringify(parsedUser));
          }
        } catch {
          // Ignorar error de parsing
        }
      }

      if (window.location.pathname !== "/first-login") {
        window.location.href = "/first-login";
      }
    }

    return Promise.reject(error);
  },
);
