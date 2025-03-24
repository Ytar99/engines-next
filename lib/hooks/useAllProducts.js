import productService from "@/lib/api/productsService";
import { useState, useEffect } from "react";

export const useAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAllProducts();
      setProducts(response.data || []);
    } catch (err) {
      setError(err.response?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    isEmpty: !loading && !error && products.length === 0,
    refresh: fetchProducts, // Можно реализовать функцию обновления
  };
};
