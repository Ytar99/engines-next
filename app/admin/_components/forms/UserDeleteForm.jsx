"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";

import { deleteUser } from "@/app/_actions/userActions";
import LoadingOverlay from "@/app/_components/loadingOverlay";

function UserDeleteForm(props) {
  const { userId } = props;

  const [state, formAction, pending] = useActionState(deleteUser, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.message || "Unknown error");
    } else if (state?.message) {
      toast.success(state?.message);
      redirect("/admin/crm/users");
    }
  }, [state]);

  return (
    <form action={formAction}>
      {pending && <LoadingOverlay fullscreen />}

      <input type="hidden" name="userId" value={userId} />

      <div className="form-actions">
        <button className="btn btn-danger btn-lg" type="submit">
          Удалить
        </button>
      </div>
    </form>
  );
}

export default UserDeleteForm;
