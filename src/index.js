import * as d3 from "d3";
import uuid from "./utils/uuid";
import icon from "./utils/icon";
import "./less/index.less";

export function init(params = {}) {
  const wrap = d3.select(`#${params.id}`);
  const svgWrap = wrap.append("svg");
  const gWrap = svgWrap.append("g");
  wrap.attr("class", "nodelayout-wrap");
  svgWrap
    .attr("width", "100%")
    .attr("height", "100%");
  if (!params.data) params.data = []
  const data = params.data.map(item => {
    return {
      id: uuid(16, 62),
      text: item,
      x: Math.random() * 400,
      y: Math.random() * 200
    }
  })
  const drag = d3
    .drag()
    .on("start", dragstart)
    .on("drag", draging)
    .on("end", dragend);;
  const objectWrap = gWrap.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id", d => d.id)
    .attr("class", "unit-dis")
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    .call(drag)
    .on("click", handleClick);
  // drag start
  function dragstart (event, d) {
    // d3.select(this).classed("fixed", false);
    d.dx = event.sourceEvent.x;
    d.dy = event.sourceEvent.y;
  }
  // draging
  function draging (event, d) {
    const $this = this;
    d.xp = d.x - (d.dx - event.sourceEvent.x);
    d.yp = d.y - (d.dy - event.sourceEvent.y);
    d3.select($this).attr("transform", () => `translate(${d.xp}, ${d.yp})`);
  }
  // drag end
  function dragend (event, d) {
    d.x = d.xp || event.sourceEvent.x;
    d.y = d.yp || event.sourceEvent.y;
  }
  // on click
  function handleClick (event, d) {
    d3.selectAll(".unit-dis").attr("class", "unit-dis");
    d3.select(this).attr("class", "unit-dis selected");
  }
  objectWrap.append("circle")
    .attr("fill", "#fff")
    .attr("stroke", "#227AE6")
    .attr("r", 25);
  objectWrap.append("g")
    .attr("transform", "translate(-15, -15)")
    .html(icon);
  objectWrap.append("text")
    .attr("y", 45)
    .attr("fill", "#111")
    .attr("style", "text-anchor: middle;")
    .text((d) => d.text);
}