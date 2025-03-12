// src/api/products.js
import apiClient from "./client";

const ProductService = {
  getAll: (params) => apiClient.get("/crm/products", { params }),

  getById: (id) => apiClient.get(`/crm/products/${id}`),

  create: (productData) => apiClient.post("/crm/products", productData),

  update: (id, productData) => apiClient.put(`/crm/products/${id}`, productData),

  delete: (id) => apiClient.delete(`/crm/products/${id}`),
};

export default ProductService;
