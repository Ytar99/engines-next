"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";

import { deleteProduct } from "@/app/_actions/productActions";
import LoadingOverlay from "@/app/_components/loadingOverlay";

function ProductDeleteForm(props) {
  const { productId } = props;

  const [state, formAction, pending] = useActionState(deleteProduct, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.message || "Unknown error");
    } else if (state?.message) {
      toast.success(state?.message);
      redirect("/admin/crm/products");
    }
  }, [state]);

  return (
    <form action={formAction}>
      {pending && <LoadingOverlay fullscreen />}

      <input type="hidden" name="productId" value={productId} />

      <div className="form-actions">
        <button className="btn btn-danger btn-lg" type="submit">
          Удалить
        </button>
      </div>
    </form>
  );
}

export default ProductDeleteForm;
