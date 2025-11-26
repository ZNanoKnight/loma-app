/**
 * Font utility for the Loma app
 * - Headers: PT Serif (serif)
 * - Body/Subtext: Quicksand (sans-serif)
 */

export type FontCategory = 'header' | 'body' | 'subtext';
export type FontWeight = 'regular' | 'light' | 'medium' | 'semiBold' | 'bold' | 'italic' | 'boldItalic';

/**
 * Get font family based on category and weight
 * @param category - 'header' for titles, 'body' for content, 'subtext' for captions
 * @param weight - 'regular', 'light', 'medium', 'semiBold', 'bold', 'italic', 'boldItalic'
 */
export const getFontFamily = (
  category: FontCategory = 'body',
  weight: FontWeight = 'regular'
): string => {
  // Headers use PT Serif
  if (category === 'header') {
    switch (weight) {
      case 'bold':
        return 'PTSerif-Bold';
      case 'italic':
        return 'PTSerif-Italic';
      case 'boldItalic':
        return 'PTSerif-BoldItalic';
      default:
        return 'PTSerif-Regular';
    }
  }

  // Subtext defaults to light weight
  if (category === 'subtext') {
    if (weight === 'bold') return 'Quicksand-Bold';
    if (weight === 'semiBold') return 'Quicksand-SemiBold';
    return 'Quicksand-Light';
  }

  // Body text
  switch (weight) {
    case 'bold':
      return 'Quicksand-Bold';
    case 'semiBold':
      return 'Quicksand-SemiBold';
    case 'medium':
      return 'Quicksand-Medium';
    case 'light':
      return 'Quicksand-Light';
    default:
      return 'Quicksand-Regular';
  }
};

/**
 * Legacy function for backward compatibility
 * Maps old weight strings to new Quicksand fonts
 */
export const getFontFamilyByWeight = (weight?: string, italic?: boolean): string => {
  // PT Serif for italic (headers)
  if (italic) {
    if (weight === 'bold' || weight === '700') return 'PTSerif-BoldItalic';
    return 'PTSerif-Italic';
  }

  switch (weight) {
    case 'bold':
    case '700':
      return 'Quicksand-Bold';

    case '600':
      return 'Quicksand-SemiBold';

    case '500':
      return 'Quicksand-Medium';

    case '300':
      return 'Quicksand-Light';

    case 'normal':
    case '400':
    default:
      return 'Quicksand-Regular';
  }
};

// Font families for direct use
export const Fonts = {
  // Serif (headers)
  header: 'PTSerif-Regular',
  headerBold: 'PTSerif-Bold',
  headerItalic: 'PTSerif-Italic',
  headerBoldItalic: 'PTSerif-BoldItalic',

  // Sans-serif (body/subtext)
  regular: 'Quicksand-Regular',
  light: 'Quicksand-Light',
  medium: 'Quicksand-Medium',
  semiBold: 'Quicksand-SemiBold',
  bold: 'Quicksand-Bold',
};
