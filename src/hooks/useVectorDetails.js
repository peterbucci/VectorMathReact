import { useCallback, useState } from "react";

const calculateMagnitude = (x, y) => Math.sqrt(x ** 2 + y ** 2);
const calculateAngleRadians = (x, y) => Math.atan2(y, x);
const toDegrees = (radians) => radians * (180 / Math.PI);
const toRadians = (degrees) => degrees * (Math.PI / 180);
const calculateAngleDegrees = (x, y) => toDegrees(calculateAngleRadians(x, y));

const useVectorDetails = (performOperation) => {
  const [vectorDetails, setVectorDetails] = useState({
    magnitude: 0,
    angle: 0,
    xComponent: 0,
    yComponent: 0,
  });

  /**
   * Function to calculate the magnitude, angle, x and y components of the active vector and
   * update the vector details.
   * @param {Object} vector - The active vector
   */
  const updateVectorDetails = useCallback(
    (vector) => {
      if (!vector) return;

      /*
       * Calculate the x and y components of the vector by dividing the difference between the end
       * and start coordinates by 10 to scale the vector to the graph
       */
      const x = (vector.endX - vector.startX) / 10;
      const y = (vector.startY - vector.endY) / 10;

      performOperation();

      const angle = calculateAngleDegrees(x, y);
      const magnitude = calculateMagnitude(x, y);

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
   * Function to handle the adjustment of the vector details based on what the user
   * updated in the text fields above the graph.
   *
   * If the xComponent or yComponent is updated, the magnitude and angle are calculated
   * If the magnitude or angle is updated, the x and y components are calculated
   * @param {string} type - The type of the vector detail
   * @param {string} value - The value of the vector detail
   */
  const onVectorInputChange = (type, value) => {
    const { xComponent, yComponent } = vectorDetails;
    const updatedDetails = { ...vectorDetails };

    // Return if the text field is empty
    if (value === "") {
      updatedDetails[type] = value;
      setVectorDetails(updatedDetails);
      return;
    }

    const parsedValue = parseFloat(value);
    updatedDetails[type] = parsedValue;

    const fixFloatingPointError = (num) => parseFloat(num.toFixed(6));

    const updateXandYComponents = (angleRadians, magnitude) => {
      updatedDetails.xComponent = fixFloatingPointError(
        Math.cos(angleRadians) * magnitude
      );
      updatedDetails.yComponent = fixFloatingPointError(
        Math.sin(angleRadians) * magnitude
      );
    };

    if (type === "xComponent" || type === "yComponent") {
      const { xComponent: x, yComponent: y } = updatedDetails;

      updatedDetails.magnitude = calculateMagnitude(x, y);
      updatedDetails.angle = calculateAngleDegrees(x, y);
    } else if (type === "magnitude") {
      updateXandYComponents(
        calculateAngleRadians(xComponent, yComponent),
        parsedValue
      );
    } else if (type === "angle") {
      updateXandYComponents(
        toRadians(parsedValue),
        calculateMagnitude(xComponent, yComponent)
      );
    }

    setVectorDetails(updatedDetails);
  };

  return { vectorDetails, updateVectorDetails, onVectorInputChange };
};

export default useVectorDetails;
