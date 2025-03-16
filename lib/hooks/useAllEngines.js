// src/hooks/useEngines.js
import { useState, useEffect } from "react";
import EngineService from "@/lib/api/engines";

export const useAllEngines = () => {
  const [state, setState] = useState({
    data: [],
    error: null,
    loading: true,
  });

  const fetchEngines = async () => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // Предполагается, что EngineService.getAll() возвращает все записи
      const response = await EngineService.getAll();

      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      toast.error("Ошибка загрузки двигателей");
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const handleRefetch = () => {
    fetchEngines(state.params);
  };

  useEffect(() => {
    fetchEngines(state.params);
  }, [state.params]);

  return {
    engines: state.data,
    loading: state.loading,
    error: state.error,
    refetch: handleRefetch,
  };
};
