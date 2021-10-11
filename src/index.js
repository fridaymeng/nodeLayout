export function isNum(value) {
  return value * value;
  // return (typeof value === 'number') && !isNaN(parseFloat(value)) && isFinite(value); 
}