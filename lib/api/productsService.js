import { BaseService } from "./baseService";
import apiClient from "./client";

class ProductService extends BaseService {
  constructor() {
    super("/crm/products", apiClient);
  }
}

const productService = new ProductService();

export default productService;
