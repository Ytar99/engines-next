// src/lib/api/engines.js
import apiClient from "./client";

const EngineService = {
  getAll: () => apiClient.get("/crm/engines"),
  getById: (id) => apiClient.get(`/crm/engines/${id}`),
  create: (engineData) => apiClient.post("/crm/engines", engineData),
  update: (id, engineData) => apiClient.put(`/crm/engines/${id}`, engineData),
  delete: (id) => apiClient.delete(`/crm/engines/${id}`),
};

export default EngineService;
