// src/lib/api/users.js
import apiClient from "./client";

const UserService = {
  getAll: (params) => apiClient.get("/crm/users", { params }),
  getById: (id) => apiClient.get(`/crm/users/${id}`),
  create: (userData) => apiClient.post("/crm/users", userData),
  update: (id, userData) => apiClient.put(`/crm/users/${id}`, userData),
  delete: (id) => apiClient.delete(`/crm/users/${id}`),
};

export default UserService;
