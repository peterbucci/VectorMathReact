import * as d3 from "d3";

class Vector {
  /**
   * Constructor for the Vector class
   * @param {string} name - Name of the vector
   * @param {string} color - Color of the vector
   * @param {object} svg - SVG element to draw the vector on
   * @param {number} startX - X coordinate of the start of the vector
   * @param {number} startY - Y coordinate of the start of the vector
   * @param {number} endX - X coordinate of the end of the vector
   * @param {number} endY - Y coordinate of the end of the vector
   * @param {boolean} isResultant - Flag to determine if this is the resultant vector
   * @param {function} onUpdate - Callback for when this vector is updated
   * @param {function} onSelect - Callback for when this vector is clicked
   */
  constructor(
    name,
    color,
    graph,
    svg,
    startX,
    startY,
    endX,
    endY,
    isResultant,
    onUpdate,
    onSelect
  ) {
    this.name = name;
    this.color = color;
    this.arrowheadSize = 4; // Size of the arrowhead
    this.graph = graph;
    this.svg = svg;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.dxAccum = 0; // Accumulated drag distance in X
    this.dyAccum = 0; // Accumulated drag distance in Y
    this.onUpdate = onUpdate; // Callback for when this vector is updated
    this.onSelect = onSelect; // Callback for when this vector is clicked
    this.isResultant = isResultant; // Flag to determine if this is the resultant vector
    this.magnitude = 0;
    this.angle = 0;
    this.label = null;

    this.draw(); // Draw the vector on the SVG
  }

  /**
   * Draw the vector on the SVG
   * This method creates the line, arrowhead, label, and hitbox elements
   */
  draw() {
    this.createArrowhead(this.color, this.name + "-arrowhead");

    // Create the line element
    this.line = this.svg
      .append("line")
      .attr("x1", this.startX)
      .attr("y1", this.startY)
      .attr("x2", this.endX)
      .attr("y2", this.endY)
      .attr("stroke", this.color)
      .attr("stroke-width", 4)
      .style("cursor", "move") // Change cursor to move when hovering over the line
      .attr("marker-end", "url(#" + this.name + "-arrowhead)") // Attach arrowhead to the line
      .on("mousedown", () => this.onSelect(this.name)) // Call onSelect when the line is clicked
      .call(d3.drag().on("drag", this.dragged.bind(this))); // Enable dragging for the line

    // Create hitbox for the arrowhead to enable dragging the end of the vector if it's not the resultant vector
    if (!this.isResultant)
      this.arrowheadHitbox = this.svg
        .append("circle")
        .attr("cx", this.endX) // X coordinate of the center of the hitbox
        .attr("cy", this.endY) // Y coordinate of the center of the hitbox
        .attr("r", 10) // Radius of the hitbox
        .attr("fill", "transparent") // Make the hitbox transparent
        .style("cursor", "pointer") // Change cursor to pointer when hovering over the hitbox
        .call(d3.drag().on("drag", this.arrowheadDragged.bind(this))); // Enable dragging for the arrowhead

    // Create and store the label element
    this.label = this.svg
      .append("text")
      .attr("dy", "-0.5em") // Offset the label a bit above the line
      .attr("text-anchor", "middle")
      .style("fill", this.color)
      .text(this.getLabelText()); // Set the text of the label

    this.update(); // Initial update to set correct positions and labels
  }

  /**
   * Callback for when the vector is dragged
   * @param {object} event - Event object for the drag event
   */
  dragged(event) {
    if (this.graph.lockToGrid) {
      this.dxAccum += event.dx; // Accumulate drag distance in X
      this.dyAccum += event.dy; // Accumulate drag distance in Y

      // Calculate the new position based on the accumulated distance
      const newStartX = this.startX + this.dxAccum;
      const newStartY = this.startY + this.dyAccum;
      const newEndX = this.endX + this.dxAccum;
      const newEndY = this.endY + this.dyAccum;

      // Snap to the nearest grid point (multiple of 10)
      this.startX = Math.round(newStartX / 10) * 10;
      this.startY = Math.round(newStartY / 10) * 10;
      this.endX = Math.round(newEndX / 10) * 10;
      this.endY = Math.round(newEndY / 10) * 10;

      // Reset accumulated distances
      this.dxAccum = newStartX - this.startX;
      this.dyAccum = newStartY - this.startY;
    } else {
      // Update the start and end coordinates based on the drag event
      this.startX += event.dx;
      this.startY += event.dy;
      this.endX += event.dx;
      this.endY += event.dy;
    }

    this.update(); // Call the update method that redraws the vector

    this.onSelect(this.name); // Call onSelect to set the active vector
  }

  /**
   * Callback for when the arrowhead is dragged
   * @param {object} event - Event object for the drag event
   */
  arrowheadDragged(event) {
    if (this.graph.lockToGrid) {
      this.dxAccum += event.dx; // Accumulate drag distance in X
      this.dyAccum += event.dy; // Accumulate drag distance in Y

      // Calculate the new position based on the accumulated distance
      const newEndX = this.endX + this.dxAccum;
      const newEndY = this.endY + this.dyAccum;

      // Snap to the nearest grid point (multiple of 10)
      this.endX = Math.round(newEndX / 10) * 10;
      this.endY = Math.round(newEndY / 10) * 10;

      // Reset accumulated distances
      this.dxAccum = newEndX - this.endX;
      this.dyAccum = newEndY - this.endY;
    } else {
      // Update the end coordinates based on the drag event
      this.endX += event.dx;
      this.endY += event.dy;
    }

    this.update(); // Call the update method that redraws the vector

    // This is a callback to update the vector details
    if (this.onUpdate)
      this.onUpdate({
        name: this.name,
        startX: this.startX,
        startY: this.startY,
        endX: this.endX,
        endY: this.endY,
      });

    this.onSelect(this.name); // Call onSelect to set the active vector
  }

  /**
   * Update the vector based on the current coordinates
   * This method is called when the vector is moved or dragged
   */
  update() {
    const dx = this.endX - this.startX; // Change in X
    const dy = this.endY - this.startY; // Change in Y
    const length = Math.sqrt(dx * dx + dy * dy); // Length of the vector
    const angle = Math.atan2(dy, dx); // Angle in radians

    // Adjust the end point to account for the arrowhead length
    const adjustedEndX = this.endX - (this.arrowheadSize - 1) * Math.cos(angle);
    const adjustedEndY = this.endY - (this.arrowheadSize - 1) * Math.sin(angle);

    // Update the position of the line based on the current coordinates
    this.line
      .attr("x1", this.startX)
      .attr("y1", this.startY)
      .attr("x2", adjustedEndX)
      .attr("y2", adjustedEndY);

    // Update the position of the arrowhead hitbox if it's not a sum vector
    if (!this.isResultant)
      this.arrowheadHitbox.attr("cx", this.endX).attr("cy", this.endY);

    // Calculate new magnitude and angle based on current coordinates
    this.magnitude = (length / 10).toFixed(2); // Round to 2 decimal places
    this.angle = angle * (180 / Math.PI); // Angle in degrees

    // Adjust angle for label readability
    let labelAngle = this.angle;
    if (labelAngle > 90 && labelAngle < 270) {
      labelAngle += 180; // Flip text by adding 180 degrees to keep it readable
    }

    // Update label position and text
    this.label
      .attr("x", (this.startX + this.endX) / 2)
      .attr("y", (this.startY + this.endY) / 2)
      .attr(
        "transform",
        `rotate(${labelAngle},${(this.startX + this.endX) / 2},${
          (this.startY + this.endY) / 2
        })`
      )
      .text(this.getLabelText());
  }

  /**
   * Update the coordinates of the vector
   * @param {number} startX - X coordinate of the start of the vector
   * @param {number} startY - Y coordinate of the start of the vector
   * @param {number} endX - X coordinate of the end of the vector
   * @param {number} endY - Y coordinate of the end of the vector
   */
  updateCoordinates(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.update(); // Call the update method that redraws the vector
  }

  /**
   * Remove the vector from the SVG
   */
  remove() {
    this.svg.select(`#${this.name}-arrowhead`).remove(); // Remove the arrowhead from the SVG
    this.arrowhead.remove(); // Remove the arrowhead element
    this.line.remove(); // Remove the line element
    this.arrowheadHitbox.remove(); // Remove the arrowhead hitbox element
    this.label.remove(); // Remove the label element
  }

  /**
   * Create an arrowhead marker for the vector
   * @param {string} color - Color of the arrowhead
   * @param {string} markerId - ID of the marker
   */
  createArrowhead(color, markerId) {
    // Add arrowhead to the svg
    this.arrowhead = this.svg
      .append("defs")
      .append("marker")
      .attr("id", markerId)
      .attr("viewBox", "0 -5 10 10") // Set the viewport to contain the arrowhead
      .attr("refX", 10 - this.arrowheadSize / 2) // Position of the tip of the arrowhead
      .attr("refY", 0) // Position of the center of the arrowhead
      .attr("markerWidth", this.arrowheadSize)
      .attr("markerHeight", this.arrowheadSize)
      .attr("orient", "auto-start-reverse") // Ensures the arrowhead points correctly
      .append("path") // Add a path to the marker
      .attr("d", "M0,-5L10,0L0,5Z") // Path for a solid triangle
      .attr("fill", color);
  }

  /**
   * Get the label text for the vector
   * @returns {string} - Label text for the vector
   */
  getLabelText() {
    return `|${this.name}| = ${this.magnitude}`; // Return the name and magnitude of the vector
  }

  /**
   * Set the name of the vector
   * @param {string} name - New name for the vector
   */
  setName(name) {
    const marker = this.svg.select(`#${this.name}-arrowhead`); // Get the arrowhead marker
    marker.attr("id", name + "-arrowhead"); // Update the ID of the marker
    this.name = name; // Update the name of the vector
    this.label.text(this.getLabelText()); // Update the label text
    this.line.attr("marker-end", "url(#" + this.name + "-arrowhead)"); // Update the marker-end attribute
  }

  /**
   * Set the color of the vector
   * @param {string} color - New color for the vector
   */
  setColor(color) {
    this.color = color;
    this.arrowhead.attr("fill", color);
    this.line.attr("stroke", color);
    this.label.style("fill", color);
  }
}

export default Vector;
