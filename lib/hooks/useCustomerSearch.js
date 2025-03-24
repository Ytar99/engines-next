// lib/hooks/useCustomerSearch.js
import { useState, useEffect } from "react";
import customerService from "@/lib/api/customerService";

export const useCustomerSearch = (searchQuery) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchCustomers = async () => {
      if (searchQuery.length < 3) return;

      try {
        setLoading(true);
        const response = await customerService.searchCustomers(searchQuery);
        setCustomers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return { customers, loading, error };
};
