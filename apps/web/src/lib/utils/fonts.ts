/**
 * Font utilities and constants for the application
 * 
 * This file defines available fonts for text elements in presentations.
 * Fonts are loaded via Google Fonts in layout.tsx with CSS variables.
 * 
 * To add custom fonts in the future:
 * 1. Add @font-face rule in globals.css
 * 2. Add font name and CSS variable to AVAILABLE_FONTS
 * 3. Ensure font files are in public/fonts/ directory
 */

export interface FontOption {
  name: string;
  value: string; // CSS font-family value
  category: 'sans-serif' | 'serif' | 'custom';
}

/**
 * Available fonts for text elements
 * Using Google Fonts via Next.js font optimization
 */
export const AVAILABLE_FONTS: FontOption[] = [
  // Sans-serif fonts (clean, modern, great for body text)
  { name: 'Inter', value: 'var(--font-inter), sans-serif', category: 'sans-serif' },
  { name: 'Roboto', value: 'var(--font-roboto), sans-serif', category: 'sans-serif' },
  { name: 'Open Sans', value: 'var(--font-open-sans), sans-serif', category: 'sans-serif' },
  { name: 'Montserrat', value: 'var(--font-montserrat), sans-serif', category: 'sans-serif' },
  { name: 'Fira Sans', value: 'var(--font-fira-sans), sans-serif', category: 'sans-serif' },
  { name: 'Poppins', value: 'var(--font-poppins), sans-serif', category: 'sans-serif' },
  { name: 'Source Sans', value: 'var(--font-source-sans), sans-serif', category: 'sans-serif' },
  { name: 'Raleway', value: 'var(--font-raleway), sans-serif', category: 'sans-serif' },
  
  // Serif fonts (elegant, traditional, great for headings)
  { name: 'Playfair Display', value: 'var(--font-playfair), serif', category: 'serif' },
  { name: 'Lora', value: 'var(--font-lora), serif', category: 'serif' },
  { name: 'Merriweather', value: 'var(--font-merriweather), serif', category: 'serif' },
  { name: 'PT Serif', value: 'var(--font-pt-serif), serif', category: 'serif' },
];

/**
 * Default font for new text elements
 */
export const DEFAULT_FONT = AVAILABLE_FONTS[0]; // Inter

/**
 * Get font option by value (CSS font-family string)
 */
export function getFontByValue(value: string): FontOption | undefined {
  return AVAILABLE_FONTS.find(font => font.value === value);
}

/**
 * Get font option by name
 */
export function getFontByName(name: string): FontOption | undefined {
  return AVAILABLE_FONTS.find(font => font.name === name);
}

/**
 * Get fallback font if provided font is not found
 */
export function getFontOrDefault(value: string | undefined): FontOption {
  if (!value) return DEFAULT_FONT;
  return getFontByValue(value) || DEFAULT_FONT;
}

