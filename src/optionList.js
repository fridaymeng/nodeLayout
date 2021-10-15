import { defaultIcon } from "./utils/icon";
import "./less/index.less";
export default function renderOptionList(params = {}) {
  function dragEnd(event, d) {
    console.log(event)
    params.add({
      text: d,
      x: event.layerX,
      y: event.layerY - 100
    });
  }
  const optionWrap = params.wrap.append("div")
    .attr("class", "svg-option-list");
  const optionLi = optionWrap.selectAll("div")
    .data(params.option)
    .enter()
    .append("div")
    .attr("draggable", "true")
    .attr("class", "svg-option-list-li")
    .attr("data-id", (d, index) => index)
    .on("dragend", dragEnd);
  optionLi.append("div")
    .html(defaultIcon);
  optionLi.append("div")
    .html(d => d);
}