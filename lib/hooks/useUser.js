// src/hooks/useUser.js
import { useState } from "react";
import UserService from "@/lib/api/users";
import { toast } from "react-toastify";

export const useUser = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const fetchUser = async (id) => {
    try {
      setState({ loading: true, error: null, data: null });
      const user = await UserService.getById(id);
      setState({ loading: false, error: null, data: user.data });
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
      toast.error(error.message || "Ошибка загрузки пользователя");
    }
  };

  const createUser = async (userData) => {
    try {
      setState({ loading: true, error: null, data: null });
      const newUser = await UserService.create(userData);
      setState({ loading: false, error: null, data: newUser.data });
      toast.success("Пользователь успешно создан");
      return newUser.data;
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
      toast.error(error.message || "Ошибка создания пользователя");
      throw error;
    }
  };

  const updateUser = async (id, updates) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const updatedUser = await UserService.update(id, updates);
      setState({ loading: false, error: null, data: updatedUser.data });
      toast.success("Данные пользователя обновлены");
      return updatedUser.data;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      toast.error(error.message || "Ошибка обновления пользователя");
      throw error;
    }
  };

  const deleteUser = async (id, cb) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await UserService.delete(id);
      setState({ loading: false, error: null, data: null });
      toast.success("Пользователь удален");
      cb();
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      toast.error(error.message || "Ошибка удаления пользователя");
      throw error;
    }
  };

  const resetUserState = () => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  };

  return {
    ...state,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    resetUserState,
  };
};
