// lib/api/cartService.js
import { BaseCatalogService } from "./baseCatalogService";
import apiClient from "./client";

class CartService extends BaseCatalogService {
  constructor() {
    super("/cart", apiClient);
  }

  async getCart() {
    const response = await this.client.get(this.endpoint);
    console.log(response);
    return this._transformCartData(response);
  }

  async addToCart(productId, quantity = 1) {
    const response = await this.client.post(this.endpoint, {
      productId,
      quantity,
    });
    return this._transformCartData(response);
  }

  async updateCartItem(productId, quantity) {
    const response = await this.client.put(`${this.endpoint}?productId=${encodeURIComponent(productId)}`, { quantity });
    return this._transformCartData(response);
  }

  async removeFromCart(productId) {
    const response = await this.client.delete(`${this.endpoint}?productId=${encodeURIComponent(productId)}`);
    return this._transformCartData(response);
  }

  async checkoutCart(orderData) {
    const response = await this.client.post(`${this.endpoint}/checkout`, orderData);
    return response;
  }

  // Преобразование данных корзины для единообразия
  _transformCartData(data) {
    return {
      items: data,
      totalItems: data.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: data.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }
}

const cartService = new CartService();
export default cartService;
