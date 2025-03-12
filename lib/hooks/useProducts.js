// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import ProductService from "@/lib/api/products";

export const useProducts = (initialParams = {}) => {
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
      ...initialParams,
    },
  });

  const fetchProducts = async (params) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const response = await ProductService.getAll(params);

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
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  // Основной эффект для загрузки данных
  useEffect(() => {
    fetchProducts(state.params);
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
    products: state.data,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,

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
