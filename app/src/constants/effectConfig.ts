// app/src/constants/effectConfig.ts
export const ROTATION_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

export const EFFECT_CONFIG = {
  spider: {
    hobby: {
      mobile: 0,
      tablet: 2,
      desktop: 5,
    },
  },
  snail: {
    other: {
      mobile: 0,
      tablet: 2,
      desktop: 5,
    },
  },
  bubble: {
    tech: {
      max: 6,
      interval: 3000,
      lifetime: 10000, // 10秒でバブル削除
    },
  },
} as const;

export const ANIMATION_CONFIG = {
  disappearDuration: {
    normal: 250,
    reduced: 100,
  },
  resize: {
    throttle: 16, // 60fps
    debounce: 200,
  },
} as const;

// 静的ヘルパー関数
export const generateRandomPosition = (
  containerWidth: number,
  containerHeight: number,
  elSize = 60,
): { top: string; left: string } => {
  const margin = Math.max(elSize, 20);
  const maxLeftPx = Math.max(margin, containerWidth - margin);
  const maxTopPx = Math.max(margin, containerHeight - margin);

  const leftPx = Math.random() * (maxLeftPx - margin) + margin;
  const topPx = Math.random() * (maxTopPx - margin) + margin;

  return { top: `${topPx}px`, left: `${leftPx}px` };
};

export const generateRandomRotation = (): number => {
  return ROTATION_ANGLES[Math.floor(Math.random() * ROTATION_ANGLES.length)];
};

export const getEffectCount = (
  category: string,
  screenWidth: number,
): number => {
  if (category === "hobby") {
    const config = EFFECT_CONFIG.spider.hobby;
    if (screenWidth < BREAKPOINTS.mobile) return config.mobile;
    if (screenWidth < BREAKPOINTS.tablet) return config.tablet;
    return config.desktop;
  }

  if (category === "other") {
    const config = EFFECT_CONFIG.snail.other;
    if (screenWidth < BREAKPOINTS.mobile) return config.mobile;
    if (screenWidth < BREAKPOINTS.tablet) return config.tablet;
    return config.desktop;
  }

  return 0;
};
