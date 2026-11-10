/**
 * Design tokens of the Distribute design system, copied from the Figma variables
 * (file di6eICmbYakl4G4noz6VpE, collections "Color" and "Dimensions").
 */

/** Semantic colors, light mode. */
export const colors = {
  bgCanvas: '#fcf9f4',
  bgSurface: '#ffffff',
  bgSubtle: '#f5efe6',
  bgBrand: '#13776c',
  bgBrandPressed: '#0e5f57',
  bgBrandSoft: '#edf7f5',
  bgBrandMuted: '#d2eee9',
  bgAccent: '#e86f4c',
  bgAccentSoft: '#fde7de',
  bgSuccessSoft: '#e2f3e7',
  bgWarningSoft: '#fcf0d8',
  bgDangerSoft: '#fbe3de',
  bgDanger: '#b3361f',
  bgDisabled: '#e8e0d3',
  textPrimary: '#24211c',
  textSecondary: '#6e6659',
  textDisabled: '#ada494',
  textOnBrand: '#ffffff',
  textBrand: '#0e5f57',
  textAccent: '#a9472b',
  textSuccess: '#24733f',
  textWarning: '#8f5b0a',
  textDanger: '#b3361f',
  borderDefault: '#e8e0d3',
  borderStrong: '#ada494',
  borderFocus: '#13776c',
  borderDanger: '#b3361f',
  iconPrimary: '#24211c',
  iconSecondary: '#6e6659',
  iconBrand: '#13776c',
  iconOnBrand: '#ffffff',
  iconAccent: '#e86f4c',
  iconSuccess: '#24733f',
  iconWarning: '#8f5b0a',
  iconDanger: '#b3361f',
} as const

/** The color tokens' names. */
export type ColorToken = keyof typeof colors

/** Overrides applied by the "high contrast" reading setting. */
export const highContrastColors: Partial<Record<ColorToken, string>> = {
  textSecondary: colors.textPrimary,
  iconSecondary: colors.iconPrimary,
  borderDefault: colors.borderStrong,
  borderStrong: colors.textSecondary,
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const

export const radius = { sm: 8, md: 12, lg: 20, full: 999 } as const

/** Minimum height of a primary touch target. */
export const TOUCH_MIN = 56

export const fonts = {
  regular: 'AtkinsonHyperlegibleNext_400Regular',
  medium: 'AtkinsonHyperlegibleNext_500Medium',
  semiBold: 'AtkinsonHyperlegibleNext_600SemiBold',
  bold: 'AtkinsonHyperlegibleNext_700Bold',
} as const

/** Text styles of the design system (font, size, line height), before the user's text scale. */
export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 40 },
  titleLarge: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34 },
  titleMedium: { fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 30 },
  titleSmall: { fontFamily: fonts.semiBold, fontSize: 19, lineHeight: 26 },
  bodyLarge: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 28 },
  bodyMedium: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  labelLarge: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24 },
  labelMedium: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
} as const

/** The text style names. */
export type TextVariant = keyof typeof typography

export const elevation = {
  card: {
    shadowColor: '#24211c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#24211c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const

/** Text scale factors offered in the reading comfort settings. */
export const TEXT_SCALES = { normal: 1, large: 1.15, xlarge: 1.3 } as const

/** A text scale option name. */
export type TextScale = keyof typeof TEXT_SCALES
