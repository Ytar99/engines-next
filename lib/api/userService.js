import { BaseService } from "./baseService";
import apiClient from "./client";

class UserService extends BaseService {
  constructor() {
    super("/crm/users", apiClient);
  }
}

const userService = new UserService();

export default userService;
