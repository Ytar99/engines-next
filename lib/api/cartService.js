// lib/api/catalogService.js
import { BaseCatalogService } from "./baseCatalogService";
import apiClient from "./client";

class CartService extends BaseCatalogService {
  constructor() {
    super("/cart", apiClient);
  }

  getCart() {
    return this.client.get(this.endpoint);
  }

  addToCart(item) {
    return this.client.post(this.endpoint, item);
  }

  updateCartItem(productId, quantity) {
    return this.client.put(`${this.endpoint}/${productId}`, { quantity });
  }

  removeFromCart(productId) {
    return this.client.delete(`${this.endpoint}/${productId}`);
  }

  checkoutCart(orderData) {
    return this.client.post(`${this.endpoint}/checkout`, orderData);
  }
}

const cartService = new CartService();
export default cartService;
