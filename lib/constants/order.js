import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import ErrorIcon from "@mui/icons-material/Error";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export const STATUS_OPTIONS = [
  { value: "NEW", label: "Новый", color: "info", icon: <HistoryToggleOffIcon /> },
  { value: "PROCESSING", label: "В обработке", color: "warning", icon: <QueryBuilderIcon /> },
  { value: "COMPLETED", label: "Завершён", color: "success", icon: <CheckCircleIcon /> },
  { value: "CANCELLED", label: "Отменен", color: "error", icon: <ErrorIcon /> },
  { value: "SHIPPED", label: "В доставке", color: "secondary", icon: <LocalShippingIcon /> },
];

export const STATUS_OPTIONS_ARRAY = STATUS_OPTIONS.map((o) => o.value);

export const STATUS_OPTIONS_OBJ = STATUS_OPTIONS.reduce((acc, o) => ({ ...acc, [o.value]: { ...o } }), {});
