import { BaseCrmService } from "./baseCrmService";
import apiClient from "./client";

class CustomerService extends BaseCrmService {
  constructor() {
    super("/crm/customers", apiClient);
    this.getCustomerOrders = this.getCustomerOrders.bind(this);
    this.searchCustomers = this.searchCustomers.bind(this);
  }

  getCustomerOrders(id) {
    return this.client.get(`${this.endpoint}/${id}/orders`);
  }

  searchCustomers(query) {
    return this.client.get(`${this.endpoint}/search?email=${query}`);
  }
}

const customerService = new CustomerService();

export default customerService;
