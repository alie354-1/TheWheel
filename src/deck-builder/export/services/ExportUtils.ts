// src/deck-builder/export/services/ExportUtils.ts

import PptxGenJS from 'pptxgenjs';
import { DeckThemeColors, DeckThemeFonts } from '../../types';

/**
 * Converts pixel values to inches for PPTX.
 * Assumes a standard DPI of 96.
 * @param px - The value in pixels.
 * @returns The value in inches.
 */
export const pxToInch = (px: number | string | undefined): number => {
  if (typeof px === 'string') {
    px = parseFloat(px);
  }
  if (typeof px !== 'number' || isNaN(px)) {
    // console.warn(`pxToInch: Invalid pixel value received: ${px}, defaulting to 1 inch.`);
    return 1; // Default to 1 inch if invalid, or handle as an error
  }
  return px / 96;
};

/**
 * Converts a hex color string to a PptxGenJS compatible hex string (removes '#').
 * @param hexColor - The hex color string (e.g., "#RRGGBB").
 * @returns The PptxGenJS compatible hex string (e.g., "RRGGBB").
 */
export const formatColorForPptx = (hexColor: string | undefined): string => {
  if (typeof hexColor !== 'string') {
    return '000000'; // Default to black if color is undefined
  }
  return hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
};

/**
 * Resolves a color value from the theme or a default.
 * @param colorValue - The color value from component style.
 * @param themeColor - The corresponding theme color (e.g., theme.colors.text).
 * @param defaultColor - A fallback color if neither is available.
 * @returns A PptxGenJS compatible hex string.
 */
export const resolveColor = (
  colorValue: string | undefined,
  themeColor: string | undefined,
  defaultColor: string = '000000'
): string => {
  return formatColorForPptx(colorValue || themeColor || defaultColor);
};


/**
 * Parses a font size string (e.g., "16px", "1em") to a number.
 * @param fontSize - The font size string.
 * @param defaultSize - The default size to return if parsing fails.
 * @returns The font size as a number.
 */
export const parseFontSize = (fontSize: string | number | undefined, defaultSize: number = 18): number => {
  if (typeof fontSize === 'number') {
    return fontSize;
  }
  if (typeof fontSize === 'string') {
    const parsed = parseInt(fontSize, 10);
    return isNaN(parsed) ? defaultSize : parsed;
  }
  return defaultSize;
};

/**
 * Gets a font face from theme or defaults.
 * @param componentFontFamily - Font family from component style.
 * @param themeFonts - The theme fonts object.
 * @param type - 'heading' or 'body' to pick from theme.
 * @param defaultFont - Default font if nothing else is specified.
 * @returns Font face string.
 */
export const resolveFontFamily = (
  componentFontFamily: string | undefined,
  themeFonts: DeckThemeFonts | undefined,
  type: 'heading' | 'body' = 'body',
  defaultFont: string = 'Arial'
): string => {
  if (componentFontFamily) return componentFontFamily;
  if (themeFonts) {
    return type === 'heading' ? (themeFonts.heading || themeFonts.body || defaultFont) : (themeFonts.body || defaultFont);
  }
  return defaultFont;
}

/**
 * Applies common styling options to PptxGenJS text properties.
 * @param props - The PptxGenJS TextPropsOptions object to modify.
 * @param style - The component's style object.
 * @param themeColors - The deck's theme colors.
 * @param themeFonts - The deck's theme fonts.
 */
export const applyCommonTextStyles = (
  props: PptxGenJS.TextPropsOptions,
  style: React.CSSProperties | undefined,
  themeColors: DeckThemeColors | undefined,
  themeFonts: DeckThemeFonts | undefined
): void => {
  if (!style) return;

  props.color = resolveColor(style.color, themeColors?.text, '000000');
  if (style.backgroundColor) {
    props.fill = { color: formatColorForPptx(style.backgroundColor) };
  }
  if (style.textAlign) {
    props.align = style.textAlign as PptxGenJS.AlignH;
  }
  props.fontSize = parseFontSize(style.fontSize, 18);

  if (style.fontWeight === 'bold' || Number(style.fontWeight) >= 700) {
    props.bold = true;
  }
  if (style.fontStyle === 'italic') {
    props.italic = true;
  }
  if (style.textDecorationLine === 'underline') {
    props.underline = { style: 'sng' }; // Simplest valid underline object, inherits text color
  }
  props.fontFace = resolveFontFamily(style.fontFamily, themeFonts);

  // Advanced properties (potentially from style or dedicated props)
  if (typeof style.opacity === 'number') {
     // PptxGenJS uses `fill` with `transparency` for text background opacity,
     // and `color` with alpha for text opacity, but direct text opacity isn't straightforward.
     // For simplicity, we'll skip direct text opacity unless a clear mapping is found.
     // If fill is already set, we can add transparency to it.
     if (props.fill && typeof props.fill === 'object' && 'color' in props.fill) {
        props.fill.transparency = Math.round((1 - style.opacity) * 100);
     }
  }
  // Line height needs conversion if specified in units other than percentage or direct number for pptx
  // PptxGenJS `lineSpacing` is in points. CSS `lineHeight` can be unitless, px, em, %.
  // This requires careful conversion. For now, only direct numbers or simple px might be convertible.
  if (style.lineHeight) {
    if (typeof style.lineHeight === 'number') { // unitless
        props.lineSpacing = parseFontSize(style.fontSize, 18) * style.lineHeight * 0.75; // Approximation: pt = px * 0.75
    } else if (typeof style.lineHeight === 'string' && style.lineHeight.endsWith('px')) {
        props.lineSpacing = parseFloat(style.lineHeight) * 0.75;
    }
    // More complex conversions (em, %) would require parent font size context.
  }
};

/**
 * Validates if the deck data is usable for export.
 * @param deck - The deck object.
 * @returns True if valid, false otherwise.
 */
export const isValidDeckData = (deck: any): boolean => {
  if (!deck || typeof deck !== 'object') {
    console.error('PPTX Export: Deck data is null or not an object.');
    return false;
  }
  if (!deck.sections || !Array.isArray(deck.sections) || deck.sections.length === 0) {
    console.error('PPTX Export: Deck has no sections or sections are not an array.');
    // Allow export of empty presentation if sections array is present but empty
    // return false; 
  }
  if (!deck.title) {
    // console.warn('PPTX Export: Deck title is missing.'); // Not critical for export itself
  }
  return true;
};

/**
 * Creates a placeholder for unsupported or errored components.
 * @param slide - The PptxGenJS slide object.
 * @param componentType - The type of the component.
 * @param layout - The layout of the component.
 * @param message - Optional message for the placeholder.
 */
export const addPlaceholderComponent = (
  slide: PptxGenJS.Slide,
  componentType: string,
  layout: { x: number; y: number; width: number; height: number },
  message?: string
): void => {
  const placeholderText = message || `[Unsupported Component: ${componentType || 'Unknown'}]`;
  slide.addText(placeholderText, {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    fill: { color: 'F0F0F0' }, // Light grey background
    color: 'A0A0A0', // Darker grey text
    align: 'center',
    valign: 'middle',
    fontSize: Math.min(12, pxToInch(layout.height) * 12), // Adjust font size based on height
    margin: pxToInch(5),
  });
  console.warn(`PPTX Export: Added placeholder for ${componentType} component.`);
};

/**
 * Safely gets a property from an object, returning a default if not found or invalid.
 * @param obj The object to query.
 * @param path The path to the property (e.g., 'data.text').
 * @param defaultValue The default value to return.
 * @returns The property value or the default.
 */
export const getSafe = (obj: any, path: string, defaultValue: any = undefined) => {
  if (!obj || typeof obj !== 'object' || !path) {
    return defaultValue;
  }
  const properties = path.split('.');
  let current = obj;
  for (const prop of properties) {
    if (current && typeof current === 'object' && prop in current) {
      current = current[prop];
    } else {
      return defaultValue;
    }
  }
  return current !== undefined ? current : defaultValue;
};

/**
 * Converts rich text (e.g., from TipTap) to a simpler string or basic PptxGenJS text objects.
 * This is a simplified version. A more robust solution would parse the JSON.
 * For now, it tries to extract plain text.
 * @param richTextData - The rich text content (e.g., TipTap JSON).
 * @returns A string or an array of PptxGenJS.TextProps objects.
 */
export const convertRichTextToPptx = (richTextData: any): string | PptxGenJS.TextProps[] => {
    if (!richTextData || typeof richTextData !== 'object') {
        return '';
    }

    let plainText = '';

    // Simplified TipTap JSON parser
    function extractText(node: any) {
        if (node.type === 'text' && node.text) {
            plainText += node.text;
        } else if (node.content && Array.isArray(node.content)) {
            node.content.forEach(extractText);
        }
        // Add newlines for block elements like paragraphs, headings
        if (['paragraph', 'heading'].includes(node.type) && !plainText.endsWith('\\n') && plainText.length > 0) {
             plainText += '\\n'; // PptxGenJS uses \n or \r for newlines in a single text object
        }
    }

    if (richTextData.type === 'doc' && Array.isArray(richTextData.content)) {
        richTextData.content.forEach(extractText);
        // Trim trailing newlines that might have been added
        if (plainText.endsWith('\\n')) {
            plainText = plainText.substring(0, plainText.length - 2);
        }
        return plainText.trim();
    }
    
    // Fallback if not TipTap JSON or unrecognized structure
    return typeof richTextData === 'string' ? richTextData : JSON.stringify(richTextData);
};


// Default dimensions for components if layout is incomplete
export const DEFAULT_COMPONENT_WIDTH = 300; // pixels
export const DEFAULT_COMPONENT_HEIGHT = 150; // pixels

/**
 * Ensures layout properties are valid numbers, providing defaults if necessary.
 * @param layout - The component's layout object.
 * @returns A validated layout object with numeric x, y, width, height.
 */
export const sanitizeLayout = (layout: any): { x: number; y: number; width: number; height: number; zIndex?: number } => {
  const defaults = {
    x: 0,
    y: 0,
    width: DEFAULT_COMPONENT_WIDTH,
    height: DEFAULT_COMPONENT_HEIGHT,
  };
  
  const getNumeric = (value: any, defaultValue: number): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return typeof num === 'number' && !isNaN(num) ? num : defaultValue;
  };

  const sanitized = {
    x: getNumeric(layout?.x, defaults.x),
    y: getNumeric(layout?.y, defaults.y),
    width: getNumeric(layout?.width, defaults.width),
    height: getNumeric(layout?.height, defaults.height),
  };

  if (layout?.zIndex !== undefined && typeof layout.zIndex === 'number' && !isNaN(layout.zIndex)) {
    (sanitized as any).zIndex = layout.zIndex;
  }
  
  // Prevent zero or negative width/height which can cause errors
  if (sanitized.width <= 0) sanitized.width = defaults.width;
  if (sanitized.height <= 0) sanitized.height = defaults.height;

  return sanitized;
};
