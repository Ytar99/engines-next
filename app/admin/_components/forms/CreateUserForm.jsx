"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";

import { createUser } from "@/app/_actions/userActions";
import LoadingOverlay from "@/app/_components/loadingOverlay";

import styles from "./CreateUserForm.module.css";
import { USER_ROLES } from "@/app/_constants";

const initialState = {
  email: "",
  password: "",
  password_confirm: "",
  role: USER_ROLES.USER,
  firstname: "",
  lastname: "",
  phone: "",
};

function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.message || "Unknown error");
    } else if (state?.message) {
      toast.success(state?.message);
      redirect("/admin/crm/users");
    }
  }, [state]);

  return (
    <form className={styles.form} action={formAction}>
      {pending && <LoadingOverlay fullscreen />}

      <input type="hidden" name="enabled" value="true" />

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input type="email" name="email" required />
      </div>

      <div className="form-group">
        <label htmlFor="password">Пароль:</label>
        <input type="password" name="password" required />
      </div>

      <div className="form-group">
        <label htmlFor="password_confirm">Повторите пароль:</label>
        <input type="password" name="password_confirm" required />
      </div>

      <div className="form-group">
        <label htmlFor="role">Роль:</label>
        <select name="role">
          <option value={USER_ROLES.USER}>Пользователь</option>
          <option value={USER_ROLES.ADMIN}>Администратор</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="firstname">Имя:</label>
        <input type="text" name="firstname" />
      </div>

      <div className="form-group">
        <label htmlFor="lastname">Фамилия:</label>
        <input type="text" name="lastname" />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Телефон:</label>
        <input type="text" name="phone" />
      </div>

      <div className="form-actions">
        <button type="reset">Очистить</button>
        <button type="submit">Создать пользователя</button>
      </div>
    </form>
  );
}

export default CreateUserForm;
