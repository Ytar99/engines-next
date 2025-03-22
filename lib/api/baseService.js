import apiClient from "./client";

export class BaseService {
  constructor(endpoint, client = apiClient) {
    this.endpoint = endpoint;
    this.client = client;

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  getAll(params) {
    return this.client.get(this.endpoint, { params });
  }

  getById(id) {
    return this.client.get(`${this.endpoint}/${id}`);
  }

  create(data) {
    return this.client.post(this.endpoint, data);
  }

  update(id, data) {
    return this.client.put(`${this.endpoint}/${id}`, data);
  }

  delete(id) {
    return this.client.delete(`${this.endpoint}/${id}`);
  }
}

export const createService = (endpoint) => new BaseService(endpoint);
