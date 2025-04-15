// lib/api/catalogService.js
import { BaseCatalogService } from "./baseCatalogService";
import apiClient from "./client";

class CatalogService extends BaseCatalogService {
  constructor() {
    super("/catalog", apiClient);
  }

  // Categories
  getCategories() {
    return this.client.get(`${this.endpoint}/categories`);
  }

  getCategoryBySlug(slug) {
    return this.client.get(`${this.endpoint}/categories/${slug}`);
  }

  getCategoryProducts(slug, params) {
    return this.client.get(`${this.endpoint}/categories/${slug}/products`, { params });
  }

  // Products
  searchProducts(params) {
    return this.client.get(`${this.endpoint}/products`, { params });
  }

  getProductDetails(id) {
    return this.client.get(`${this.endpoint}/products/${id}`);
  }

  // Orders
  getOrder(orderId, email) {
    return this.client.get(`${this.endpoint}/orders/${orderId}`, {
      params: { email },
    });
  }
}

const catalogService = new CatalogService();
export default catalogService;
