export const clearPhone = (phone) => phone?.replace(/[^\d]/g, "").slice(0, 10) || "";

export const formatPhone = (phone) => {
  const cleaned = clearPhone(phone);
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : "";
};

export const formatCurrency = (currency) => {
  return Number(currency).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
};

export function limitString(str, limit) {
  return str.length > limit ? `${str.slice(0, limit)}...` : str;
}

export function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}
