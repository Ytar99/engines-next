import { v4 as uuidv4 } from "uuid";
import { BaseCrmService } from "./baseCrmService";
import apiClient from "./client";

class ProductService extends BaseCrmService {
  constructor() {
    super("/crm/products", apiClient);
    this.getAllProducts = this.getAllProducts.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  async getAllProducts() {
    return this.client.get(`${this.endpoint}/all`);
  }

  async uploadImage(productId, blob) {
    const formData = new FormData();
    const uuid = uuidv4();
    formData.append("image", blob, `${uuid}.webp`);

    return this.client.post(`${this.endpoint}/${productId}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async removeImage(productId) {
    return this.client.delete(`${this.endpoint}/${productId}/remove-image`);
  }
}

const productService = new ProductService();

export default productService;
