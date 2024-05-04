/**
 * LabelWithSubscript component
 * @param {string} main - Main text
 * @param {string} sub - Subscript text
 * @returns {JSX.Element} LabelWithSubscript component
 */
const LabelWithSubscript = ({ main, sub }) => (
  <label>
    {main}
    <sub>{sub}</sub>
  </label>
);

export default LabelWithSubscript;
