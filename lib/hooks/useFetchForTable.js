// src/hooks/useFetchForTable.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const useFetchForTable = ({ initialFilters = {}, getAll, transformFilters }) => {
  const [state, setState] = useState({
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    error: null,
    loading: false,
    params: {
      page: 1,
      limit: 10,
      search: "",
      ...initialFilters,
    },
  });

  const fetchData = useCallback(
    async (params) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        const transformedParams = transformFilters ? transformFilters(params) : params;
        const response = await getAll(transformedParams);

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
        toast.error(`Ошибка загрузки: ${error}`);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    },
    [getAll, transformFilters]
  );

  const handleRefetch = () => {
    fetchData(state.params);
  };

  // Основной эффект для загрузки данных
  useEffect(() => {
    fetchData(state.params);
  }, [state.params, fetchData]);

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

  const handleSearchChange = (searchTerm) => {
    setParams({
      search: searchTerm,
      page: 1,
    });
  };

  return {
    data: state.data,
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
