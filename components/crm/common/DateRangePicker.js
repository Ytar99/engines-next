import { TextField } from "@mui/material";
import DatePicker from "react-datepicker";
import { useEffect } from "react";

const createUTCDate = (date) => {
  if (!date) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

const formatUTCDate = (date) => {
  if (!date) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
};

const DateRangePicker = ({ value = [null, null], onChange }) => {
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const utcStart = createUTCDate(start);
    const utcEnd = createUTCDate(end);

    // Устанавливаем конец периода на 23:59:59 UTC
    if (utcEnd) {
      utcEnd.setUTCHours(23, 59, 59, 999);
    }

    onChange([utcStart, utcEnd]);
  };

  const displayValue = [
    value[0] ? new Date(value[0].getTime() + value[0].getTimezoneOffset() * 60000) : null,
    value[1] ? new Date(value[1].getTime() + value[1].getTimezoneOffset() * 60000) : null,
  ];

  return (
    <DatePicker
      isClearable
      selectsRange
      selected={displayValue[0]}
      startDate={displayValue[0]}
      endDate={displayValue[1]}
      onChange={handleDateChange}
      calendarStartDay={1}
      dateFormat="dd.MM.yyyy"
      locale="ru"
      customInput={
        <TextField
          fullWidth
          size="small"
          slotProps={{ input: { readOnly: true, placeholder: "Выберите период..." } }}
          value={
            value[0] && value[1] ? `${formatUTCDate(value[0])} - ${formatUTCDate(value[1])}` : formatUTCDate(value[0])
          }
          sx={{
            "& .MuiInputBase-input": {
              cursor: "pointer",
              py: 1,
              pr: "1.5rem",
            },
          }}
        />
      }
      renderDayContents={(day) => <span>{day}</span>}
    />
  );
};

export default DateRangePicker;
