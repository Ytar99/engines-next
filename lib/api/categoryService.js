import { v4 as uuidv4 } from "uuid";
import { BaseCrmService } from "./baseCrmService";
import apiClient from "./client";

class CategoryService extends BaseCrmService {
  constructor() {
    super("/crm/categories", apiClient);

    this.getAll = this.getAll.bind(this);
    this.unlinkProduct = this.unlinkProduct.bind(this);
    this.unlinkAllProducts = this.unlinkAllProducts.bind(this);
    this.linkProduct = this.linkProduct.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }

  async getAll(params) {
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

  async uploadImage(categoryId, blob) {
    const formData = new FormData();
    const uuid = uuidv4();
    formData.append("image", blob, `${uuid}.webp`);

    return this.client.post(`${this.endpoint}/${categoryId}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async removeImage(categoryId) {
    return this.client.delete(`${this.endpoint}/${categoryId}/remove-image`);
  }
}

const categoryService = new CategoryService();

export default categoryService;
