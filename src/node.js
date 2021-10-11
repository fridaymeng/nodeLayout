function isNum(value) {
  return (typeof value === 'number') && !isNaN(parseFloat(value)) && isFinite(value); 
}