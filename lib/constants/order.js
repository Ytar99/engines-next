export const STATUS_OPTIONS = [
  { value: "PROCESSING", label: "В обработке" },
  { value: "COMPLETED", label: "Завершён" },
  { value: "CANCELLED", label: "Отменен" },
  { value: "NEW", label: "Новый" },
  { value: "SHIPPED", label: "В доставке" },
];

export const STATUS_OPTIONS_OBJ = STATUS_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {});

export const STATUS_COLORS = {
  PROCESSING: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
  NEW: "primary",
  SHIPPED: "secondary",
};
