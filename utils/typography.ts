// 字体权重映射到字体名称
export const fontWeightToFamily = {
  '400': 'outFitRegular',
  '500': 'outFitMedium',
  '600': 'outFitSemiBold',
  '700': 'outFitBold',
  'normal': 'outFitRegular',
  'medium': 'outFitMedium',
  'semibold': 'outFitSemiBold',
  'bold': 'outFitBold',
} as const;

// 创建字体样式
export const createFontStyle = (weight: keyof typeof fontWeightToFamily) => ({
  fontFamily: fontWeightToFamily[weight],
  // 在某些平台上可能还需要fontWeight
  fontWeight: weight,
});

// 预定义的文本样式
export const typography = {
  h1: {
    ...createFontStyle('bold'),
  },
  h2: {
    ...createFontStyle('semibold'),
  },
  h3: {
    ...createFontStyle('semibold'),
  },
  body1: {
    ...createFontStyle('medium'),
  },
  body2: {
    ...createFontStyle('normal'),
  },
  caption: {
    ...createFontStyle('normal'),
  },
  button: {
    ...createFontStyle('semibold'),
  },
} as const; 