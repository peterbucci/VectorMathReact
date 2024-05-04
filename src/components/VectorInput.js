import React from "react";
import LabelWithSubscript from "./LabelWithSubscript";

/**
 * A component that represents a single input field for a vector value.
 * @param {Object} props - The component props
 * @param {string} props.label - The label for the input field
 * @param {string} props.subLabel - The sublabel for the input field
 * @param {number} props.value - The value of the input field
 * @param {function} props.onChange - The change handler for the input field
 * @param {boolean} props.readOnly - Whether the input field is read-only
 * @returns {JSX.Element} The VectorInput component
 */
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
