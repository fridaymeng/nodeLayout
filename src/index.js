import * as d3 from "d3";
import uuid from "./utils/uuid";
import icon from "./utils/icon";
import "./less/index.less";

export function init(params = {}) {
  const wrap = d3.select(`#${params.id}`);
  const svgWrap = wrap.append("svg");
  const gWrap = svgWrap.append("g");
  // circle radius
  const mainCirceRadius = 25;
  const smallCirceRadius = 5;
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
  /*** 绘制箭头 ***/    
  let markerWrap = svgWrap.append("defs");  
  markerWrap.append("marker")  
    .attr("id","arrowEnd")  
    .attr("markerUnits","strokeWidth")  
    .attr("markerWidth","12")  
    .attr("markerHeight","12")  
    .attr("viewBox","0 0 12 12")   
    .attr("refX","10")  
    .attr("refY","6")  
    .attr("orient","auto")
    .append("path")
    .attr("d","M2,2 L10,6 L2,10 L6,6 L2,2")  
    .attr("class","pathArrow");
  markerWrap.append("marker")  
    .attr("id","arrowStart")  
    .attr("markerUnits","strokeWidth")  
    .attr("markerWidth","12")  
    .attr("markerHeight","12")  
    .attr("viewBox","0 0 12 12")   
    .attr("refX","0")  
    .attr("refY","6")  
    .attr("orient","auto")
    .append("path")
    .attr("d","M10,2 L2,6 L10,10 L6,6 L10,2")
    .attr("class","pathArrow");
  const drag = d3
    .drag()
    .on("start", dragstart)
    .on("drag", draging)
    .on("end", dragend);
  // connect line
  gWrap.append("line")
    .attr("class", "connect-line")
    .attr("marker-end","url(#arrowEnd)");
  const objectWrap = gWrap.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id", d => d.id)
    .attr("class", "unit-dis")
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    .on("click", handleClick);
  // drag start
  function dragstart (event, d) {
    // d3.select(this).classed("fixed", false);
    d.dx = event.sourceEvent.x;
    d.dy = event.sourceEvent.y;
  }
  // draging
  function draging (event, d) {
    const $this = this.parentNode;
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
  // small circle drag
  const smallCircleDrag = d3
    .drag()
    .on("start", smallCircleDragstart)
    .on("drag", smallCircleDraging)
    .on("end", smallCircleDragend);
  // handle small circle
  function smallCircleDragstart (event, d) {
    d.dx = event.sourceEvent.x;
    d.dy = event.sourceEvent.y;
  }
  function smallCircleDraging (event, d) {
    d3.select(".connect-line")
      .attr("class", "connect-line show")
      .attr("x1", d.dx - smallCirceRadius * 2)
      .attr("y1", d.dy - smallCirceRadius * 2)
      .attr("x2", event.sourceEvent.x - smallCirceRadius * 2)
      .attr("y2", event.sourceEvent.y - smallCirceRadius * 2);
  }
  function smallCircleDragend (event, d) {

  }
  // main circle
  objectWrap.append("circle")
    .attr("fill", "#fff")
    .attr("class", "main-circle")
    .attr("stroke", "#227AE6")
    .attr("r", mainCirceRadius)
    .call(drag);
  // small circle
  objectWrap.selectAll(".small-circle")
    .data([{
        x       : 0,
        y       : -mainCirceRadius
    },{
        x       : mainCirceRadius,
        y       : 0
    },{
        x       : 0,
        y       : mainCirceRadius
    },{
        x       : -mainCirceRadius,
        y       : 0
    }])
    .enter()
    .append("circle")
    .attr("class","small-circle")
    .attr("cx",d => d.x)
    .attr("cy",d => d.y)
    .attr("r", smallCirceRadius)
    .call(smallCircleDrag);
  // icon
  objectWrap.append("g")
    .attr("transform", "translate(-15, -15)")
    .html(icon);
  objectWrap.append("text")
    .attr("y", 45)
    .attr("fill", "#111")
    .attr("style", "text-anchor: middle;")
    .text((d) => d.text);
}