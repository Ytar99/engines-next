"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";

import { editProduct } from "@/app/_actions/productActions";
import LoadingOverlay from "@/app/_components/loadingOverlay";

function ProductEditForm({ product, engines }) {
  const [state, formAction, pending] = useActionState(editProduct, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.message || "Unknown error");
    } else if (state?.message) {
      toast.success(state?.message);
      redirect("/admin/crm/products");
    }
  }, [state]);

  return (
    <form styles={{ position: "relative" }} action={formAction}>
      {pending && <LoadingOverlay fullscreen />}

      <input type="hidden" name="id" value={product?.id || ""} />

      <div className="form-group">
        <label htmlFor="article">Артикул:</label>
        <input type="text" name="article" defaultValue={product?.article || ""} required />
      </div>

      <div className="form-group">
        <label htmlFor="name">Название:</label>
        <input type="text" name="name" defaultValue={product?.name || ""} required />
      </div>

      <div className="form-group">
        <label htmlFor="article">Описание:</label>
        <textarea name="description" style={{ resize: "vertical" }} defaultValue={product?.description || ""} />
      </div>

      <div className="form-group">
        <label htmlFor="name">Цена:</label>
        <input
          key={`price-input-${state?.data?.price}`}
          type="number"
          name="price"
          min={0}
          max={999999}
          step="0.01"
          defaultValue={product?.price || ""}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">Количество:</label>
        <input
          key={`count-input-${state?.data?.count}`}
          type="number"
          name="count"
          min={0}
          max={999999}
          defaultValue={product?.count || "0"}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="engineId">Двигатель:</label>
        <select key={`engineId-input-${state?.data?.engineId}`} name="engineId" defaultValue={product?.engineId || ""}>
          <option value="">Выберите опцию...</option>
          {engines.map((engine) => (
            <option key={engine.id} value={engine.id}>
              {engine.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="reset">Очистить</button>
        <button type="submit">Обновить продукт</button>
      </div>
    </form>
  );
}

export default ProductEditForm;
