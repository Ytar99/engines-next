// src/lib/api/customers.js
import apiClient from "./client";

const CustomerService = {
  getAll: (params) => {
    if (params?.limit) return apiClient.get("/crm/customers", { params });
    return apiClient.get("/crm/customers/all");
  },
  getById: (id) => apiClient.get(`/crm/customers/${id}`),
  create: (customerData) => apiClient.post("/crm/customers", customerData),
  update: (id, customerData) => apiClient.put(`/crm/customers/${id}`, customerData),
  delete: (id) => apiClient.delete(`/crm/customers/${id}`),
};

export default CustomerService;
