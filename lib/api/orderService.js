import { BaseCrmService } from "./baseCrmService";
import apiClient from "./client";

class OrderService extends BaseCrmService {
  constructor() {
    super("/crm/orders", apiClient);
  }
}

const orderService = new OrderService();

export default orderService;
