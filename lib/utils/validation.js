// utils/validation.js
export const validateProduct = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || "article" in data) {
    if (!data.article?.trim()) errors.push("Артикул обязателен");
    else if (!/^[A-Z0-9-]{3,20}$/i.test(data.article)) errors.push("Неверный формат артикула");
  }

  if (!isUpdate || "name" in data) {
    if (!data.name?.trim()) errors.push("Название обязательно");
  }

  if ("price" in data) {
    if (isNaN(data.price) || parseFloat(data.price) <= 0) errors.push("Некорректная цена");
  }

  if ("count" in data) {
    if (isNaN(data.count) || parseInt(data.count) < 0) errors.push("Некорректное количество");
  }

  if ("engineId" in data && data.engineId) {
    if (isNaN(data.engineId)) errors.push("Некорректный ID двигателя");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};
