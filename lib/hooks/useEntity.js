import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const useEntity = (service, config = { enableToast: true, defaultParams: {}, fetchOnMount: false }) => {
  const [state, setState] = useState({
    data: null,
    items: [],
    loading: false,
    error: null,
    params: {},
  });

  const { enableToast = true, defaultParams = {}, fetchOnMount = true } = config;

  // Общая обработка ошибок
  const handleError = useCallback(
    (error, defaultMessage) => {
      const message = error.message || defaultMessage;
      if (enableToast) toast.error(message);
      return message;
    },
    [enableToast]
  );

  // Базовые операции CRUD
  const fetchItem = useCallback(
    async (id, cb) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const response = await service.getById(id);
        setState((prev) => ({
          ...prev,
          data: response.data,
          loading: false,
          error: null,
        }));
        cb && cb();
        return response.data;
      } catch (error) {
        const message = handleError(error, "Ошибка загрузки данных");
        setState((prev) => ({ ...prev, loading: false, error: message }));
        // throw error;
      }
    },
    [service, handleError]
  );

  const fetchItems = useCallback(
    async (params = {}, cb) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const response = await service.getAll({ ...defaultParams, ...params });
        setState((prev) => ({
          ...prev,
          items: response.data,
          loading: false,
          error: null,
          params,
        }));
        cb && cb();
        return response.data;
      } catch (error) {
        const message = handleError(error, "Ошибка загрузки списка");
        setState((prev) => ({ ...prev, loading: false, error: message }));
        // throw error;
      }
    },
    [service, defaultParams, handleError]
  );

  const createItem = useCallback(
    async (itemData, cb) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const response = await service.create(itemData);
        setState((prev) => ({
          ...prev,
          data: response.data,
          loading: false,
          error: null,
        }));
        if (enableToast) toast.success("Запись успешно создана");
        cb && cb();
        return response.data;
      } catch (error) {
        const message = handleError(error, "Ошибка создания записи");
        setState((prev) => ({ ...prev, loading: false, error: message }));
        // throw error;
      }
    },
    [service, enableToast, handleError]
  );

  const updateItem = useCallback(
    async (id, updates, cb) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const response = await service.update(id, updates);
        setState((prev) => ({
          ...prev,
          data: response.data,
          loading: false,
          error: null,
        }));
        if (enableToast) toast.success("Изменения сохранены");
        cb && cb();
        return response.data;
      } catch (error) {
        const message = handleError(error, "Ошибка обновления записи");
        setState((prev) => ({ ...prev, loading: false, error: message }));
        // throw error;
      }
    },
    [service, enableToast, handleError]
  );

  const deleteItem = useCallback(
    async (id, cb) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        await service.delete(id);
        setState((prev) => ({
          ...prev,
          data: null,
          loading: false,
          error: null,
        }));
        if (enableToast) toast.success("Запись удалена");
        cb && cb();
        return true;
      } catch (error) {
        const message = handleError(error, "Ошибка удаления записи");
        setState((prev) => ({ ...prev, loading: false, error: message }));
        // throw error;
      }
    },
    [service, enableToast, handleError]
  );

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (fetchOnMount) fetchItems(defaultParams);
  }, [fetchItems, fetchOnMount, defaultParams]);

  return {
    ...state,
    fetchItem,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setEntityState: setState,
  };
};
