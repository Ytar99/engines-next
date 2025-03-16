// src/hooks/useEngines.js
import { useState, useEffect } from "react";
import EngineService from "@/lib/api/engines";
import { toast } from "react-toastify";

export const useEngines = (initialParams = {}) => {
  const [state, setState] = useState({
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    error: null,
    loading: true,
    params: {
      page: 1,
      limit: 10,
      search: "",
      ...initialParams,
    },
  });

  const fetchEngines = async (params) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const response = await EngineService.getAll(params);

      setState((prev) => ({
        ...prev,
        data: response.data,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        },
        loading: false,
      }));
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

  // Основной эффект для загрузки данных
  useEffect(() => {
    fetchEngines(state.params);
  }, [state.params]);

  // Обновление параметров с пагинацией
  const setParams = (newParams) => {
    setState((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        ...newParams,
      },
    }));
  };

  // Обработчики для пагинации
  const handlePageChange = (newPage) => {
    setParams({ page: newPage });
  };

  const handleRowsPerPageChange = (newLimit) => {
    setParams({ limit: newLimit, page: 1 });
  };

  // Обновление фильтров (сбрасываем на первую страницу)
  const handleFilterChange = (filters) => {
    setParams({
      ...filters,
      page: 1,
    });
  };

  // Обновление поискового запроса (с debounce можно добавить)
  const handleSearchChange = (searchTerm) => {
    setParams({
      search: searchTerm,
      page: 1,
    });
  };

  return {
    engines: state.data,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,

    refetch: handleRefetch,

    // Методы для управления пагинацией
    setPage: handlePageChange,
    setLimit: handleRowsPerPageChange,

    // Методы для фильтрации
    setFilters: handleFilterChange,
    setSearch: handleSearchChange,

    // Полное обновление параметров
    updateParams: setParams,
  };
};
