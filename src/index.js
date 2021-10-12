import * as d3 from "d3";

export function init(params = {}) {
  const wrap = d3.select(`#${params.id}`);
  const svgWrap = wrap.append("svg");
  const gWrap = svgWrap.append("g");
  wrap.attr("style", `border: 1px solid #ddd; background: #fff; border-radius: 5px; height: 400px; width: 100%`);
  svgWrap
    .attr("width", "100%")
    .attr("height", "100%");
  if (!params.data) params.data = []
  const data = params.data.map(item => {
    return {
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
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    .call(drag);
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
    d.x = d.xp;
    d.y = d.yp;
  }
  objectWrap.append("circle")
    .attr("fill", "#08c")
    .attr("r", 10);
  objectWrap.append("text")
    .attr("y", 40)
    .attr("fill", "#111")
    .attr("style", "text-anchor: middle;")
    .text((d) => d.text);
}