import { BaseService } from "./baseService";
import apiClient from "./client";

class EngineService extends BaseService {
  constructor() {
    super("/crm/engines", apiClient);
  }

  getAll(params) {
    return params?.limit ? super.getAll(params) : this.client.get(`${this.endpoint}/all`);
  }
}

const engineService = new EngineService();

export default engineService;
