// src/hooks/useProduct.js
import { useState } from "react";
import ProductService from "../api/products";

export const useProduct = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const fetchProduct = async (id) => {
    try {
      setState({ loading: true, error: null, data: null });
      const product = await ProductService.getById(id);
      setState({ loading: false, error: null, data: product.data });
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
    }
  };

  const createProduct = async (productData) => {
    try {
      setState({ loading: true, error: null, data: null });
      const newProduct = await ProductService.create(productData);
      setState({ loading: false, error: null, data: newProduct.data });
      return newProduct.data;
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const updatedProduct = await ProductService.update(id, updates);
      setState({ loading: false, error: null, data: updatedProduct.data });
      return updatedProduct.data;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await ProductService.delete(id);
      setState({ loading: false, error: null, data: null });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  return {
    ...state,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
