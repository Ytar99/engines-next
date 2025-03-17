// utils/validation.js

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) => !phone || /^\d{10}$/.test(phone);

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

export const validateEngine = (data, isUpdate = false) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push("Название обязательно");
  } else if (data.name.trim().length < 2) {
    errors.push("Название должно быть не менее 2 символов");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};

export const validateCustomer = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || "email" in data) {
    if (!data.email?.trim()) {
      errors.push("Email обязателен");
    } else if (!validateEmail(data.email)) {
      errors.push("Неверный формат email");
    }
  }

  if ("phone" in data && data.phone && !validatePhone(data.phone)) {
    errors.push("Телефон должен содержать 10 цифр");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};
