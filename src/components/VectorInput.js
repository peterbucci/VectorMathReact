import React from "react";
import LabelWithSubscript from "./LabelWithSubscript";

const VectorInput = ({
  label,
  subLabel,
  value,
  onChange,
  readOnly = false,
}) => {
  return (
    <div className="field-container">
      {subLabel ? (
        <LabelWithSubscript main={label} sub={subLabel} />
      ) : (
        <label>{label}</label>
      )}
      <input
        type="number"
        className="vector-value-input"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  );
};

export default VectorInput;
