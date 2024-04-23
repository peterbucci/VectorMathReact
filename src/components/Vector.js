import * as d3 from "d3";

class Vector {
  constructor(
    name,
    svg,
    startX,
    startY,
    endX,
    endY,
    onUpdate,
    onSelect,
    isSum = false
  ) {
    this.name = name;
    this.svg = svg;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.lastSnappedEndX = 0;
    this.lastSnappedEndY = 0;
    this.onUpdate = onUpdate; // Callback for when this vector is updated
    this.onSelect = onSelect; // Callback for when this vector is clicked
    this.isSum = isSum; // Flag to determine if this is a sum vector
    this.draw();
  }

  draw() {
    this.line = this.svg
      .append("line")
      .attr("x1", this.startX)
      .attr("y1", this.startY)
      .attr("x2", this.endX)
      .attr("y2", this.endY)
      .attr("stroke", "black")
      .attr("stroke-width", 4)
      .style("cursor", "move")
      .attr("marker-end", "url(#arrowhead)")
      .on("mousedown", () =>
        this.onSelect({
          name: this.name,
          startX: this.startX,
          startY: this.startY,
          endX: this.endX,
          endY: this.endY,
        })
      )
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
    let newEndX = Math.round((this.endX + event.dx) / 10) * 10;
    let newEndY = Math.round((this.endY + event.dy) / 10) * 10;

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
}

export default Vector;
