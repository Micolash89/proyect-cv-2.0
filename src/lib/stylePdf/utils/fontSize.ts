export const getFontSize = (base: number, ajuste: number = 0): number => {
  return base + ajuste;
};

export const getPadding = (ajuste: number, base: number = 40): number => {
  const reduction = Math.min(ajuste * 5, 25);
  return base - reduction;
};

export const getHeaderFontSize = (base: number, ajuste: number = 0): number => {
  return base + ajuste;
};

export const getBodyFontSize = (base: number, ajuste: number = 0): number => {
  return base + ajuste;
};
