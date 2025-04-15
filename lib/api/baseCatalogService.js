import apiClient from "./client";

export class BaseCatalogService {
  constructor(endpoint, client = apiClient) {
    this.endpoint = endpoint;
    this.client = client;
  }
}

export const createService = (endpoint) => new BaseCatalogService(endpoint);
