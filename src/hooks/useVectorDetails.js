import { useCallback, useState } from "react";

const useVectorDetails = (performOperation) => {
  const [vectorDetails, setVectorDetails] = useState({
    magnitude: 0,
    angle: 0,
    xComponent: 0,
    yComponent: 0,
  });

  /**
   * Function to update the vector details based on the active vector
   * and calculate the magnitude, angle, x and y components of the active vector
   * @param {Object} vector - The active vector
   */
  const updateVectorDetails = useCallback(
    (vector) => {
      if (!vector) return; // Return if there is no active vector
      /*
       * Calculate the x and y components of the vector by dividing the difference between the end
       * and start coordinates by 10 to scale the vector to the graph
       */
      const x = (vector.endX - vector.startX) / 10;
      const y = (vector.startY - vector.endY) / 10;

      performOperation(); // Perform the selected operation

      const angle = Math.atan2(y, x) * (180 / Math.PI); // Calculate the angle of the vector
      const magnitude = Math.sqrt(x ** 2 + y ** 2); // Calculate the magnitude of the vector

      setVectorDetails((prev) => ({
        ...prev,
        magnitude,
        angle,
        xComponent: x,
        yComponent: y,
      }));
    },
    [performOperation]
  );

  /**
   * Function to handle the adjustment of the vector details based on the type
   * If the type is xComponent or yComponent, the magnitude and angle are calculated
   * If the type is magnitude or angle, the x and y components are calculated
   * @param {string} type - The type of the vector detail
   * @param {string} value - The value of the vector detail
   */
  const handleVectorAdjust = (type, value) => {
    const { xComponent, yComponent } = vectorDetails; // Get the x and y components
    const updatedDetails = { ...vectorDetails }; // Get the updated vector details

    // Return if the value is not a number
    if (value === "") {
      updatedDetails[type] = value;
      setVectorDetails(updatedDetails);
      return;
    }

    const parsedValue = parseFloat(value); // Parse the value to a float
    let angleRadians, magnitude; // Initialize the angle in radians and magnitude
    updatedDetails[type] = parsedValue; // Update the vector details based on the type

    // If the type is xComponent or yComponent, calculate the magnitude and angle
    if (type === "xComponent" || type === "yComponent") {
      // To calculate the magnitude, use the Pythagorean theorem
      updatedDetails.magnitude = Math.sqrt(
        updatedDetails.xComponent ** 2 + updatedDetails.yComponent ** 2
      );
      // To calculate the angle, use the arctangent function and convert to degrees by multiplying by 180/π
      updatedDetails.angle =
        Math.atan2(updatedDetails.yComponent, updatedDetails.xComponent) *
        (180 / Math.PI);
    } else if (type === "magnitude") {
      // If the type is magnitude, calculate the x and y components
      magnitude = parsedValue; // Set the magnitude to the parsed value
      angleRadians = Math.atan2(yComponent, xComponent); // Calculate the angle using the arctangent function
      updatedDetails.xComponent = Math.cos(angleRadians) * magnitude; // Calculate the x component
      updatedDetails.yComponent = Math.sin(angleRadians) * magnitude; // Calculate the y component
    } else if (type === "angle") {
      // If the type is angle, calculate the x and y components
      angleRadians = parsedValue * (Math.PI / 180); // Convert the angle to radians by multiplying by π/180
      magnitude = Math.sqrt(xComponent ** 2 + yComponent ** 2); // Calculate the magnitude using the Pythagorean theorem
      updatedDetails.xComponent = Math.cos(angleRadians) * magnitude; // Calculate the x component
      updatedDetails.yComponent = Math.sin(angleRadians) * magnitude; // Calculate the y component
    }

    // Correct for floating-point precision errors
    updatedDetails.xComponent = parseFloat(
      updatedDetails.xComponent.toFixed(6)
    );
    updatedDetails.yComponent = parseFloat(
      updatedDetails.yComponent.toFixed(6)
    );

    setVectorDetails(updatedDetails); // Update the vector details
  };

  return { vectorDetails, updateVectorDetails, handleVectorAdjust };
};

export default useVectorDetails;
