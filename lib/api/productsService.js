import { BaseService } from "./baseService";
import apiClient from "./client";

class ProductService extends BaseService {
  constructor() {
    super("/crm/products", apiClient);
    this.getAllProducts = this.getAllProducts.bind(this);
  }

  getAllProducts() {
    return this.client.get(`${this.endpoint}/all`);
  }
}

const productService = new ProductService();

export default productService;
