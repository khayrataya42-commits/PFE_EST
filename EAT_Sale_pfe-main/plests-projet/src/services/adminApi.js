import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://127.0.0.1:8003",
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const setAdminToken = (token) => {
  if (token) {
    adminApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete adminApi.defaults.headers.common["Authorization"];
  }
};

export const getUsers = async () => {
  const response = await adminApi.get("/admin/users/");
  return response.data;
};

export const createUser = async (payload) => {
  const response = await adminApi.post("/admin/users/", payload);
  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await adminApi.put(`/admin/users/${userId}`, payload);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await adminApi.delete(`/admin/users/${userId}`);
  return response.data;
};

export default adminApi;