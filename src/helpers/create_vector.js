import Vector from "../components/Vector";

// array of 25 colors
const colors = [
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "black",
  "brown",
  "#fcba03",
  "magenta",
  "darkgreen",
  "darkorange",
];

/**
 * Create a new vector and add it to the vector storage
 * @param {Object} vectorStorageRef - Reference to the vector storage
 * @param {Object} graphInstanceRef - Reference to the graph instance
 * @param {function} setActiveVector - Function to set the active vector
 * @param {function} updateVectorDetails - Function to update the vector details
 * @param {number} startX - The start X coordinate of the vector
 * @param {number} startY - The start Y coordinate of the vector
 * @param {number} endX - The end X coordinate of the vector
 * @param {number} endY - The end Y coordinate of the vector
 * @param {boolean} isSum - Whether the vector is a sum vector
 * @param {string} letter - The letter to assign to the vector
 */
const createVector = (
  vectorStorageRef,
  graphInstanceRef,
  setActiveVector,
  updateVectorDetails,
  startX,
  startY,
  endX,
  endY,
  isSum,
  letter
) => {
  const vectors = vectorStorageRef.current; // Get the current vector storage
  const graph = graphInstanceRef.current; // Get the current graph instance
  // Create a new vector with the given parameters or default values
  const newLetter = letter
    ? letter
    : String.fromCharCode(97 + Object.values(vectors).length - 1); // Ensure unique letter assignment

  const color = colors[Object.values(vectors).length]; // Assign a color to the vector

  const newStartX = startX ? startX : 0; // Default start X coordinate
  const newStartY = startY ? startY : 0; // Default start Y coordinate
  const newEndX = endX ? endX : 10; // Default end X coordinate
  const newEndY = endY ? endY : 10; // Default end Y coordinate

  // Create a new vector and add it to the vector storage
  vectors[newLetter] = new Vector(
    newLetter,
    color,
    graph.svg,
    newStartX * graph.cellSize,
    graph.height - newStartY * graph.cellSize,
    newEndX * graph.cellSize,
    graph.height - newEndY * graph.cellSize,
    isSum,
    updateVectorDetails,
    setActiveVector
  );
};

/**
 * Rename the vectors in the vector storage
 * @param {Object} vectorStorageRef - Reference to the vector storage
 */
export const renameVectors = (vectorStorageRef) => {
  const { s, ...vectorStorage } = vectorStorageRef.current; // Get the current vector storage without the sum vector
  const vectors = Object.values(vectorStorage); // Get the vectors from the storage
  vectorStorageRef.current = { s }; // Reset the vector storage with the sum vector
  // Rename the vectors in the storage and update the color
  vectors.forEach((vector, index) => {
    const letter = String.fromCharCode(97 + index); // Get the letter for the vector
    vector.setName(letter); // Set the name of the vector
    vector.setColor(colors[index + 1]); // Set the color of the vector
    vectorStorageRef.current[letter] = vector; // Add the vector to the storage
  });
};

export default createVector;
