import * as d3 from "d3";

class Vector {
  constructor(
    name,
    color,
    svg,
    startX,
    startY,
    endX,
    endY,
    isSum,
    onUpdate,
    onSelect
  ) {
    this.name = name;
    this.color = color;
    this.svg = svg;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.onUpdate = onUpdate; // Callback for when this vector is updated
    this.onSelect = onSelect; // Callback for when this vector is clicked
    this.isSum = isSum; // Flag to determine if this is a sum vector
    this.draw();
  }

  draw() {
    this.createArrowhead(this.color, this.name + "-arrowhead");

    this.line = this.svg
      .append("line")
      .attr("x1", this.startX)
      .attr("y1", this.startY)
      .attr("x2", this.endX)
      .attr("y2", this.endY)
      .attr("stroke", this.color)
      .attr("stroke-width", 4)
      .style("cursor", "move")
      .attr("marker-end", "url(#" + this.name + "-arrowhead)")
      .on("mousedown", () => this.onSelect(this.name))
      .call(d3.drag().on("drag", this.dragged.bind(this)));

    if (!this.isSum)
      this.arrowhead = this.svg
        .append("circle")
        .attr("cx", this.endX)
        .attr("cy", this.endY)
        .attr("r", 10)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .call(d3.drag().on("drag", this.arrowheadDragged.bind(this)));
  }

  dragged(event) {
    this.startX = this.startX + event.dx;
    this.startY = this.startY + event.dy;
    this.endX = this.endX + event.dx;
    this.endY = this.endY + event.dy;
    this.update();
  }

  arrowheadDragged(event) {
    this.endX = this.endX + event.dx;
    this.endY = this.endY + event.dy;

    this.update();
    if (this.onUpdate)
      this.onUpdate({
        name: this.name,
        startX: this.startX,
        startY: this.startY,
        endX: this.endX,
        endY: this.endY,
      });

    this.onSelect(this.name);
  }

  update() {
    this.line
      .attr("x1", this.startX)
      .attr("y1", this.startY)
      .attr("x2", this.endX)
      .attr("y2", this.endY);
    if (!this.isSum) this.arrowhead.attr("cx", this.endX).attr("cy", this.endY);
  }

  updateCoordinates(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.update(); // Call the update method that redraws the vector
  }

  createArrowhead(color, markerId) {
    // Add arrowhead to the svg
    this.svg
      .append("defs")
      .append("marker")
      .attr("id", markerId)
      .attr("viewBox", "0 -5 10 10") // Set the viewport to contain the arrowhead
      .attr("refX", 8) // Position of the tip of the arrowhead
      .attr("refY", 0)
      .attr("markerWidth", 4) // Marker size relative to the line
      .attr("markerHeight", 4)
      .attr("orient", "auto-start-reverse") // Ensures the arrowhead points correctly
      .append("path")
      .attr("d", "M0,-5L10,0L0,5Z") // Path for a solid triangle
      .attr("fill", color);
  }

  changeArrowheadDirection(operation) {
    console.log("changing arrowhead direction", operation);
    const tempStartX = this.startX;
    const tempStartY = this.startY;
    const tempEndX = this.endX;
    const tempEndY = this.endY;
    this.endX = tempStartX;
    this.endY = tempStartY;
    this.startX = tempEndX;
    this.startY = tempEndY;
    this.update();
  }
}

export default Vector;