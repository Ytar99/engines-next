import { BaseCrmService } from "./baseCrmService";
import apiClient from "./client";

class EngineService extends BaseCrmService {
  constructor() {
    super("/crm/engines", apiClient);
  }

  getAll(params) {
    return params?.limit ? super.getAll(params) : this.client.get(`${this.endpoint}/all`);
  }
}

const engineService = new EngineService();

export default engineService;
