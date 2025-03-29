import { BaseService } from "./baseService";
import apiClient from "./client";

class CategoryService extends BaseService {
  constructor() {
    super("/crm/categories", apiClient);

    this.getAll = this.getAll.bind(this);
    this.unlinkProduct = this.unlinkProduct.bind(this);
    this.unlinkAllProducts = this.unlinkAllProducts.bind(this);
    this.linkProduct = this.linkProduct.bind(this);
  }

  getAll(params) {
    return params?.limit ? super.getAll(params) : this.client.get(`${this.endpoint}/all`);
  }

  // Отвязать категорию от конкретного продукта
  async unlinkProduct(categoryId, productId) {
    return this.client.delete(`${this.endpoint}/${categoryId}/products/${productId}`);
  }

  // Отвязать категорию от всех продуктов
  async unlinkAllProducts(categoryId) {
    return this.client.post(`${this.endpoint}/${categoryId}/unlink-all`);
  }

  async linkProduct(categoryId, productId) {
    return this.client.post(`${this.endpoint}/${categoryId}/products/${productId}`);
  }
}

const categoryService = new CategoryService();

export default categoryService;
