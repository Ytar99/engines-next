import { BaseService } from "./baseService";
import apiClient from "./client";

class CustomerService extends BaseService {
  constructor() {
    super("/crm/customers", apiClient);
  }
}

const customerService = new CustomerService();

export default customerService;
