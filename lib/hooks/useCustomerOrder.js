import { useState, useEffect } from "react";
import customerService from "@/lib/api/customerService";

export const useCustomerOrders = (customerId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      // Валидация ID
      if (!customerId || isNaN(customerId)) {
        setError(new Error("Invalid customer ID"));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await customerService.getCustomerOrders(customerId);
        setOrders(response.data || []);
      } catch (err) {
        setError(err.response?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]); // Зависимость от customerId

  return {
    orders,
    loading,
    error,
    isEmpty: !loading && !error && orders.length === 0,
  };
};
