// src/hooks/useUsers.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import UserService from "@/lib/api/users";

export const useUsers = (initialParams = {}) => {
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

  const fetchUsers = async (params) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const response = await UserService.getAll(params);

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
      toast.error("Ошибка загрузки пользователей");
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const handleRefetch = () => {
    fetchUsers(state.params);
  };

  useEffect(() => {
    fetchUsers(state.params);
  }, [state.params]);

  const setParams = (newParams) => {
    setState((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        ...newParams,
      },
    }));
  };

  const handlePageChange = (newPage) => {
    setParams({ page: newPage });
  };

  const handleRowsPerPageChange = (newLimit) => {
    setParams({ limit: newLimit, page: 1 });
  };

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
    users: state.data,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    refetch: handleRefetch,
    setPage: handlePageChange,
    setLimit: handleRowsPerPageChange,
    setFilters: handleFilterChange,
    setSearch: handleSearchChange,
    updateParams: setParams,
  };
};
