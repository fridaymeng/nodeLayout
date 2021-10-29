import * as d3 from "d3";
import uuid from "./utils/uuid";
import deepProxy from "./utils/deepProxy";
import renderOptionList from "./optionList";
import { defaultIcon, deletIcon } from "./utils/icon";
import "./less/index.less";

let objectWrap, gWrap, pathWrap;
// control the animation
let isInit = true;
let nodeData = deepProxy((data) => {
  renderNodes({
    data
  });
});;
// circle radius
const mainCirceRadius = 25;
const smallCirceRadius = 5;
const svgWidth = 1000;
const svgHeight = 400;
// the x,y change when zoom
let zoomX = 0;
let zoomY = 0;
let zoomK = 0;
// onNodeClick 
let onNodeClick;
// onPathClick
let onPathClick;
// line type
let connectType = "line";

const connectData = deepProxy((data) => {
  renderLines(data);
});

// main circle drag
const drag = d3
  .drag()
  .on("start", dragstart)
  .on("drag", draging)
  .on("end", dragend);

function renderNodes (params = {}) {
  d3.selectAll(".unit-dis").remove();
  objectWrap = gWrap.selectAll("g")
    .data(params.data)
    .enter()
    .append("g")
    .attr("id", d => d.id)
    .attr("class", "unit-dis")
    .call(drag)
    .on("click", handleClick)
    .attr('transform', (d) => isInit ? `translate(0, 0)` : `translate(${d.x}, ${d.y})` );
  if (isInit) {
    objectWrap.transition()
      .duration(750)
      .delay(function(d, i) { return i * 10; })
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);
  }
  renderMain();
}

// on click
function handleClick (event, d) {
  if (onNodeClick) onNodeClick(d);
  d3.selectAll(".unit-dis").attr("class", "unit-dis");
  d3.select(this).attr("class", "unit-dis selected");
}

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
  connectData.data.forEach(item => {
    const index = item.source === d.id ? item.startIndex : item.endIndex;
    const xValue = Math.cos(Math.PI / 180 * index * 90) * mainCirceRadius;
    const yValue = Math.sin(Math.PI / 180 * index * 90) * mainCirceRadius;
    if (item.source === d.id) {
      item.x1 = d.xp + xValue;
      item.y1 = d.yp + yValue;
    } else if (item.target === d.id) {
      item.x2 = d.xp + xValue;
      item.y2 = d.yp + yValue;
    }
  });
  renderLines(connectData.data);
  d3.select($this).attr("transform", () => `translate(${d.xp}, ${d.yp})`);
}
// drag end
function dragend (event, d) {
  d.x = d.xp || event.sourceEvent.x;
  d.y = d.yp || event.sourceEvent.y;
}

// draw connect lines
function renderLines (data) {
  pathWrap.selectAll(".connect-fixed-line").remove();
  const allPath = pathWrap.selectAll(".connect-fixed-line")
    .data(data)
    .enter()
    .append("path")
    .attr("class", (d) => `start-${d.source} end-${d.target} connect-fixed-line`)
    .attr("marker-end","url(#arrowEnd)")
    .attr("d", (d) => isInit ? `M0,0 0,0` : `M${d.x1},${d.y1} ${d.x2},${d.y2}`)
    .attr("data-id", d => d.id)
    .on("click", (event, d) => {
      if (onPathClick) onPathClick(d);
    });
  if (isInit) {
    allPath.transition()
      .duration(750)
      .delay(function(d, i) { return i * 10; })
      .attr("d", (d) => `M${d.x1},${d.y1} ${d.x2},${d.y2}`);
  }
  isInit = false;
}

function handleDeleteNode(event, d) {
  nodeData.data = nodeData.data.filter (item => d.id !== item.id);
  connectData.data = connectData.data.filter (item => {
    return item.source !== d.id && item.target !== d.id;
  })
}

function renderMain () {
  // delete button
  objectWrap.append("g")
    .attr("class", "delete-circle")
    .attr("title", "delete")
    .attr("transform", `translate(${mainCirceRadius}, ${-mainCirceRadius - 5})`)
    .on("click", handleDeleteNode)
    .html(deletIcon);
  // small circle drag
  const smallCircleDrag = d3
    .drag()
    .on("start", smallCircleDragstart)
    .on("drag", smallCircleDraging)
    .on("end", smallCircleDragend);
  // handle small circle
  function smallCircleDragstart (event, d) {
    d.dx = event.sourceEvent.layerX - Math.cos(Math.PI / 180 * d.index * 90) * smallCirceRadius;
    d.dy = event.sourceEvent.layerY - Math.sin(Math.PI / 180 * d.index * 90) * smallCirceRadius;
  }
  function smallCircleDraging (event, d) {
    const k = zoomK === 0 ? 1 : zoomK;
    d.x1 = (d.dx - zoomX)/k;
    d.y1 = (d.dy - zoomY)/k;
    d.x2 = (event.sourceEvent.layerX - zoomX)/k;
    d.y2 = (event.sourceEvent.layerY - zoomY)/k;
    let pos = `M${d.x1},${d.y1} ${d.x2},${d.y2}`;
    if (connectType === "path") {
      console.log(d);
      switch (d.index) {
        case 0:
          pos = `M${d.x1},${d.y1} C${d.x2},${d.y1} ${d.x1},${d.y2}  ${d.x2},${d.y2}`;
        break;
        case 1:
          pos = `M${d.x1},${d.y1} C${d.x1},${d.y2} ${d.x2},${d.y1}  ${d.x2},${d.y2}`;
        break;
        case 2:
          pos = `M${d.x1},${d.y1} C${d.x2},${d.y1} ${d.x1},${d.y2}  ${d.x2},${d.y2}`;
        break;
        case 3:
          pos = `M${d.x1},${d.y1} C${d.x1},${d.y2} ${d.x2},${d.y1}  ${d.x2},${d.y2}`;
        break;
        default:
          pos = `M${d.x1},${d.y1} ${d.x2},${d.y2}`;
      }
    }
    d3.select(".connect-line")
      .attr("class", "connect-line show")
      .attr("d", pos);
  }
  function smallCircleDragend (event, d) {
    d3.select(".connect-line").attr("class", "connect-line");
    const hasAcitve = document.querySelector(".small-circle.active");
    if (hasAcitve) {
      connectData.push({
        source: this.parentNode.getAttribute("id"),
        target: hasAcitve.parentNode.getAttribute("id"),
        startIndex: d.index,
        endIndex: Number(hasAcitve.dataset.index),
        x1: d.x1,
        y1: d.y1,
        x2: d.x2,
        y2: d.y2
      });
    }
  }
  // main circle
  objectWrap.append("circle")
    .attr("fill", "#fff")
    .attr("class", "main-circle")
    .attr("stroke", "#227AE6")
    .attr("r", mainCirceRadius);
  // small circle
  const smallCircelData = [{
    x : mainCirceRadius,
    y : 0,
    index: 0
  },{
    x : 0,
    y : mainCirceRadius,
    index: 1
  },{
    x : -mainCirceRadius,
    y : 0,
    index: 2
  },{
    x : 0,
    y : -mainCirceRadius,
    index: 3
  }];
  objectWrap.selectAll(".small-circle")
    .data(smallCircelData)
    .enter()
    .append("circle")
    .attr("class","small-circle")
    .attr("data-index", (d) => d.index)
    .attr("cx",d => d.x)
    .attr("cy",d => d.y)
    .attr("r", smallCirceRadius)
    .on("mouseenter",function(d){
      this.setAttribute("class","small-circle active");
    })
    .on("mouseleave",function(d){
      this.setAttribute("class","small-circle");
    })
    .call(smallCircleDrag);
  // icon
  objectWrap.append("g")
    .attr("transform", "translate(-15, -15)")
    .html(defaultIcon);
  objectWrap.append("text")
    .attr("y", 45)
    .attr("fill", "#111")
    .attr("style", "text-anchor: middle;")
    .text((d) => d.text);
}

function init(params = {}) {
  const wrap = d3.select(`#${params.id}`).attr("height", svgHeight);
  connectType = params.connectType || "line"
  renderOptionList({
    wrap,
    add,
    option: params.list
  });
  const wraps = wrap.append("div");
  const svg = wraps.append("svg");
  // fill pattern
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", svgHeight)
    .attr("fill", "url(#diagramPattern)")
    .on("click", (event) => {
      d3.selectAll(".unit-dis").attr("class", "unit-dis");
    })
    .call(
      d3.zoom()
      .scaleExtent([.1, 100])
      .on("zoom", svgZoomed)
    );
  const svgWrap = svg.append("g");
  pathWrap = svgWrap.append("g");
  gWrap = svgWrap.append("g");
  wrap.attr("class", "nodelayout-wrap");
  svg
    .attr("width", "100%")
    .attr("height", svgHeight);
  // connect line
  gWrap.append("path")
    .attr("class", "connect-line")
    .attr("marker-end","url(#arrowEnd)");
  function svgZoomed(d) {
    zoomX = d.transform.x;
    zoomY = d.transform.y;
    zoomK = d.transform.k;
    svgWrap.attr("transform", d.transform);
  }
  if (!params.nodes) params.nodes = [];
  if (params.onNodeClick) onNodeClick = params.onNodeClick;
  if (params.onPathClick) onPathClick = params.onPathClick;
  nodeData.data = params.nodes.map((item, index) => {
    return {
      id: item.id,
      text: item.title,
      x: svgWidth/10 + index * 200,
      y: svgHeight / 2
    };
  });
  // node connect line
  if (params.lines) {
    params.lines.forEach(item => {
      connectData.push({
        id: uuid(),
        source: item.source,
        target: item.target,
        startIndex: 0,
        endIndex: 2,
        x1: nodeData.data[0].x + Math.cos(Math.PI / 180 * 2 * 90) * mainCirceRadius,
        y1: nodeData.data[0].y + Math.sin(Math.PI / 180 * 0 * 90) * mainCirceRadius,
        x2: nodeData.data[1].x + Math.cos(Math.PI / 180 * 2 * 90) * mainCirceRadius,
        y2: nodeData.data[1].y + Math.sin(Math.PI / 180 * 0 * 90) * mainCirceRadius
      });
    });
  }
  // arrow  
  let markerWrap = svg.append("defs");  
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
  /* 网格 */
  const gridArr = new Array(20);
  const patternWrap = markerWrap
    .append("pattern")
    .attr("id", "diagramPattern")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 100)
    .attr("height", 100)
    .attr("patternUnits", "userSpaceOnUse");
  patternWrap
    .selectAll("path")
    .data(gridArr)
    .enter()
    .append("path")
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", "0.25")
    .attr("dashArray", "")
    .attr("d", (d, index) => {
      if (index === 0) {
      return `M0,0.5 L100,0.5 Z`;
      } else if (index < 10 && index > 0) {
      return `M0,${index * 10}.125 L100,${index * 10}.125 Z`;
      } else if (index === 10) {
      return `M0.5,0 L0.5,100 Z`;
      } else if (index > 10) {
      return `M${(index - 10) * 10}.125,0 L${(index - 10) * 10}.125,100 Z`;
        }
    });
}

function add (params = {}) {
  const x = params.x || svgWidth/10 + nodeData.data.length * 200;
  const y = params.y || svgHeight/2;
  const k = zoomK === 0 ? 1 : zoomK;
  nodeData.push({
    id: uuid(),
    text: params.title || params + (nodeData.data.length + 1),
    x: (x - zoomX) / k,
    y: (y - zoomY) / k
  });
}
export { init, add };