import Vector from "../components/Vector";

const createVector = (
  name,
  color,
  startX,
  startY,
  endX,
  endY,
  isSum,
  graph,
  onSelect,
  onUpdate
) => {
  return new Vector(
    name,
    color,
    graph.svg,
    startX * graph.cellSize,
    graph.height - startY * graph.cellSize,
    endX * graph.cellSize,
    graph.height - endY * graph.cellSize,
    isSum,
    onUpdate,
    onSelect
  );
};

export default createVector;
