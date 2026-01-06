export const formatCurrency = (value: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export const formatCompactNumber = (number: number) => 
  new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(number);