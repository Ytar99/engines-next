import { BaseService } from "./baseService";
import apiClient from "./client";

class CustomerService extends BaseService {
  constructor() {
    super("/crm/customers", apiClient);
    this.getCustomerOrders = this.getCustomerOrders.bind(this);
  }

  getCustomerOrders(id) {
    return this.client.get(`${this.endpoint}/${id}/orders`);
  }
}

const customerService = new CustomerService();

export default customerService;
