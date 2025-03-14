// src/hooks/useEngines.js
import { useState, useEffect } from "react";
import EngineService from "@/lib/api/engines"; // Предполагается, что сервис создан

export const useEngines = () => {
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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const handleRefetch = () => {
    fetchEngines();
  };

  useEffect(() => {
    fetchEngines();
  }, []);

  return {
    engines: state.data,
    loading: state.loading,
    error: state.error,
    refetch: handleRefetch,
  };
};
