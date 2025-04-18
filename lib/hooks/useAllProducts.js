import productService from "@/lib/api/productsService";
import { useState, useEffect } from "react";

export const useAllProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAllProducts();
      setData(response.data || []);
    } catch (err) {
      setError(err.response?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    isEmpty: !loading && !error && data.length === 0,
    refresh: fetchData, // Можно реализовать функцию обновления
  };
};
