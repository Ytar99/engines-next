// src/hooks/useCustomer.js
import { useState } from "react";
import CustomerService from "@/lib/api/customers";
import { toast } from "react-toastify";

export const useCustomer = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const fetchCustomer = async (id) => {
    try {
      setState({ loading: true, error: null, data: null });
      const engine = await CustomerService.getById(id);
      setState({ loading: false, error: null, data: engine.data });
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
    }
  };

  const createCustomer = async (engineData) => {
    try {
      setState({ loading: true, error: null, data: null });
      const newCustomer = await CustomerService.create(engineData);
      setState({ loading: false, error: null, data: newCustomer.data });
      toast.success("Покупатель успешно создан");
      return newCustomer.data;
    } catch (error) {
      toast.error(error.message || "Ошибка создания покупателя");
      setState({ loading: false, error: error.message, data: null });
      throw error;
    }
  };

  const updateCustomer = async (id, updates) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const updatedCustomer = await CustomerService.update(id, updates);
      setState({ loading: false, error: null, data: updatedCustomer.data });
      toast.success("Данные покупателя обновлены");
      return updatedCustomer.data;
    } catch (error) {
      toast.error(error.message || "Ошибка обновления покупателя");
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const deleteCustomer = async (id, cb) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await CustomerService.delete(id);
      setState({ loading: false, error: null, data: null });
      toast.success("Покупатель удален");
      cb();
    } catch (error) {
      toast.error(error.message || "Ошибка удаления покупателя");
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  return {
    ...state,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
