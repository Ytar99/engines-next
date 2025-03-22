import { BaseService } from "./baseService";
import apiClient from "./client";

class OrderService extends BaseService {
  constructor() {
    super("/crm/orders", apiClient);
  }
}

const orderService = new OrderService();

export default orderService;
