import { IMaskInput } from "react-imask";
import { forwardRef, useEffect } from "react";

const PhoneMask = forwardRef(function PhoneMask(props, ref) {
  const { onChange, ...other } = props;

  return (
    <IMaskInput
      {...other}
      mask="(000) 000-00-00"
      definitions={{ 0: /[0-9]/ }}
      inputRef={ref}
      onAccept={(value, mask) => {
        onChange({ target: { name: props.name, value: mask.unmaskedValue } });
      }}
      overwrite
    />
  );
});

export default PhoneMask;
