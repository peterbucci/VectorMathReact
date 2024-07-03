import React, { useCallback, useEffect, useRef, useState } from "react";
import Graph from "./components/Graph";
import VectorDetails from "./components/VectorDetails";
import VectorControls from "./components/VectorControls";
import GithubLink from "./components/GithubLink";
import useVectorDetails from "./hooks/useVectorDetails";
import createVector, { renameVectors } from "./helpers/create_vector";
import "./styles/App.css";

const App = () => {
  const svgContainerRef = useRef(null);
  const graphInstanceRef = useRef(null);
  const vectorStorageRef = useRef({});

  const [selectedOperation, setSelectedOperation] = useState("Addition");
  const [activeVector, setActiveVector] = useState(null);
  const [lockToGrid, setLockToGrid] = useState(true);

  /**
   * Function to perform the selected operation on the created vectors.
   * Currently supports Addition and Subtraction.
   */
  const performOperation = useCallback(() => {
    // Destructure the vector storage and remove the vector sum
    const { s, ...vectorStorage } = vectorStorageRef.current;
    const graphInstance = graphInstanceRef.current;

    switch (graphInstance.selectedOperation) {
      case "Addition":
        graphInstance.handleVectorAddition(Object.values(vectorStorage));
        break;
      case "Subtraction":
        graphInstance.handleVectorSubtraction(Object.values(vectorStorage));
        break;
      default:
        break;
    }
  }, []);

  const { vectorDetails, updateVectorDetails, onVectorInputChange } =
    useVectorDetails(performOperation);

  /**
   * UseEffect hook to update the vector details when the active vector changes
   */
  useEffect(() => {
    const vector = vectorStorageRef.current[activeVector];
    updateVectorDetails(vector);
  }, [activeVector, updateVectorDetails]);

  /**
   * Function to create a new vector and update the vector storage
   * @param {number} startX - The x-coordinate of the start point of the vector
   * @param {number} startY - The y-coordinate of the start point of the vector
   * @param {number} endX - The x-coordinate of the end point of the vector
   * @param {number} endY - The y-coordinate of the end point of the vector
   * @param {boolean} isResultant - A boolean to determine if the vector is the resultant vector
   * @param {string} name - The name of the vector
   */
  const createVectorHandler = useCallback(
    (...args) => {
      // Create a new vector if there are less than 11 vectors
      if (Object.values(vectorStorageRef.current).length < 11)
        createVector(
          vectorStorageRef,
          graphInstanceRef,
          setActiveVector,
          updateVectorDetails,
          ...args
        );
    },
    [updateVectorDetails]
  );

  /**
   * UseEffect hook to create the graph and vectors when the component mounts
   */
  useEffect(() => {
    // Return if the SVG container is not available or the graph instance is already created
    if (!svgContainerRef.current || graphInstanceRef.current) return;

    // Create a new Graph instance
    const newGraph = new Graph(svgContainerRef.current, 55, 35, lockToGrid);
    graphInstanceRef.current = newGraph;

    // Create starting vectors
    createVectorHandler(15, 10, 0, 0, true, "s");
    createVectorHandler(15, 10, 15, 20);
    createVectorHandler(15, 20, 35, 20);

    // Set the resultant vector and perform the operation
    newGraph.resultantVector = vectorStorageRef.current.s;
    performOperation();
  }, [createVectorHandler, updateVectorDetails, performOperation, lockToGrid]);

  /**
   * Function to save the vector details and update the vector coordinates
   */
  const saveVector = () => {
    const vector = vectorStorageRef.current[activeVector]; // Get the active vector
    const { xComponent, yComponent } = vectorDetails; // Get the x and y components

    // Return if the vector, x component or y component is not available
    if (!vector || isNaN(xComponent) || isNaN(yComponent)) return;

    // Initialize the new start X and Y coordinates
    let newStartX = vector.startX;
    let newStartY = vector.startY;

    // Calculate the new end coordinates based on the x and y components
    let newEndX = vector.startX + xComponent * 10;
    let newEndY = vector.startY - yComponent * 10;

    // If lockToGrid is true, snap to the nearest grid point (multiple of 10)
    if (graphInstanceRef.current.lockToGrid) {
      newStartX = Math.round(newStartX / 10) * 10;
      newStartY = Math.round(newStartY / 10) * 10;
      newEndX = Math.round(newEndX / 10) * 10;
      newEndY = Math.round(newEndY / 10) * 10;
    }

    // Update the vector coordinates
    vector.updateCoordinates(newStartX, newStartY, newEndX, newEndY);
    updateVectorDetails({
      ...vector,
      startX: newStartX,
      startY: newStartY,
      endX: newEndX,
      endY: newEndY,
    }); // Update the vector details

    performOperation(); // Perform the selected operation
  };

  /**
   * Function to add a new vector to the vector storage and set it as the active vector
   */
  const handleVectorAdd = () => {
    const vectorStorage = vectorStorageRef.current;
    createVectorHandler();
    setActiveVector(vectorStorage[Object.keys(vectorStorage).pop()].name);
  };

  /**
   * Function to delete the active vector and update the vector storage
   * @param {string} vector - The active vector
   */
  const handleVectorDelete = () => {
    // Return if the active vector is not available
    if (vectorStorageRef.current[activeVector]) {
      vectorStorageRef.current[activeVector].remove(); // Remove the active vector
      delete vectorStorageRef.current[activeVector]; // Delete the active vector from the vector storage
      renameVectors(vectorStorageRef); // Rename the vectors in the vector storage
      performOperation(); // Perform the selected operation
      setActiveVector(null); // Set the active vector to null
    }
  };

  /**
   * Function to change the selected operation.
   * Currently supports Addition and Subtraction.
   * @param {Object} e - The event object
   */
  const handleOperationChange = (e) => {
    setSelectedOperation(e.target.value);
    graphInstanceRef.current.selectedOperation = e.target.value;
    performOperation();
  };

  /**
   * Function to toggle the lock to grid feature
   * @param {Object} e - The event object
   */
  const handleVectorLockToggle = () => {
    graphInstanceRef.current.lockToGrid = !lockToGrid;
    setLockToGrid(!lockToGrid);
    saveVector();
  };

  return (
    <div className="App">
      <VectorDetails
        activeVector={activeVector}
        vectorDetails={vectorDetails}
        onVectorInputChange={onVectorInputChange}
        saveVector={saveVector}
        setActiveVector={setActiveVector}
      />
      <div ref={svgContainerRef} />
      <VectorControls
        activeVector={activeVector}
        selectedOperation={selectedOperation}
        numberOfVectors={Object.values(vectorStorageRef.current).length}
        handleOperationChange={handleOperationChange}
        handleVectorAdd={handleVectorAdd}
        handleVectorDelete={handleVectorDelete}
        lockToGrid={lockToGrid}
        handleVectorLockToggle={handleVectorLockToggle}
      />
      <GithubLink />
    </div>
  );
};

export default App;
