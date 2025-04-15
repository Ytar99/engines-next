import { BaseCrmService } from "./baseCrmService";
import apiClient from "./client";

class UserService extends BaseCrmService {
  constructor() {
    super("/crm/users", apiClient);
  }
}

const userService = new UserService();

export default userService;
