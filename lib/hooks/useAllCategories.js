import { useState, useEffect } from "react";
import categoryService from "@/lib/api/categoryService";

export const useAllCategories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryService.getAll();
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
