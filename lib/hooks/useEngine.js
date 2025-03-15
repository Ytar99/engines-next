// src/hooks/useEngine.js
import { useState } from "react";
import EngineService from "@/lib/api/engines";

export const useEngine = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const fetchEngine = async (id) => {
    try {
      setState({ loading: true, error: null, data: null });
      const engine = await EngineService.getById(id);
      setState({ loading: false, error: null, data: engine.data });
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
    }
  };

  const createEngine = async (engineData) => {
    try {
      setState({ loading: true, error: null, data: null });
      const newEngine = await EngineService.create(engineData);
      setState({ loading: false, error: null, data: newEngine.data });
      return newEngine.data;
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
      throw error;
    }
  };

  const updateEngine = async (id, updates) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const updatedEngine = await EngineService.update(id, updates);
      setState({ loading: false, error: null, data: updatedEngine.data });
      return updatedEngine.data;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const deleteEngine = async (id, cb) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await EngineService.delete(id);
      setState({ loading: false, error: null, data: null });
      cb();
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  return {
    ...state,
    fetchEngine,
    createEngine,
    updateEngine,
    deleteEngine,
  };
};
