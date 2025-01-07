"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";

import { editUser } from "@/app/_actions/userActions";
import LoadingOverlay from "@/app/_components/loadingOverlay";

import styles from "./CreateUserForm.module.css";
import { USER_ROLES } from "@/app/_constants";

function EditUserForm({ user }) {
  const [state, formAction, pending] = useActionState(editUser, null);

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

      <input type="hidden" name="id" value={user?.id || ""} />

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input type="email" name="email" required defaultValue={user?.email || ""} />
      </div>

      <div className="form-group">
        <label htmlFor="password">Пароль:</label>
        <input
          type="password"
          name="password"
          // required
          defaultValue=""
          autoComplete="new-password"
          aria-autocomplete="list"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password_confirm">Повторите пароль:</label>
        <input
          type="password"
          name="password_confirm"
          // required
          defaultValue=""
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">Роль:</label>
        <select name="role" defaultValue={user?.role || USER_ROLES.USER}>
          <option value={USER_ROLES.USER}>Пользователь</option>
          <option value={USER_ROLES.ADMIN}>Администратор</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="firstname">Имя:</label>
        <input type="text" name="firstname" defaultValue={user?.firstname || ""} />
      </div>

      <div className="form-group">
        <label htmlFor="lastname">Фамилия:</label>
        <input type="text" name="lastname" defaultValue={user?.lastname || ""} />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Телефон (10 цифр):</label>
        <input
          type="text"
          name="phone"
          defaultValue={user?.phone || ""}
          minLength="10"
          maxLength="10"
          pattern="[0-9]{10}"
        />
      </div>

      <div className="form-group">
        <label htmlFor="enabled">Активен:</label>
        <select name="enabled" defaultValue={user?.enabled || "true"}>
          <option value="true">Да</option>
          <option value="false">Нет</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="reset">Очистить</button>
        <button type="submit">Обновить пользователя</button>
      </div>
    </form>
  );
}

export default EditUserForm;
