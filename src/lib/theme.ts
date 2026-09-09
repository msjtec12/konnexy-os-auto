// Dynamic Theme System for Konnexy OS Auto White-Labeling

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Pre-calculated high-contrast, beautiful Tailwind-like scales for presets
export const PRESET_THEME_PALETTES: Record<string, ColorShades> = {
  // 1. Azul Konnexy (#2563EB)
  '#2563eb': {
    50: '239 246 255',
    100: '219 234 254',
    200: '191 219 254',
    300: '147 197 253',
    400: '96 165 250',
    500: '59 130 246',
    600: '37 99 235',
    700: '29 78 216',
    800: '30 64 175',
    900: '30 58 138',
  },
  // 2. Verde Esmeralda (#16A34A)
  '#16a34a': {
    50: '240 253 244',
    100: '220 252 231',
    200: '187 247 208',
    300: '134 239 172',
    400: '74 222 128',
    500: '34 197 94',
    600: '22 163 74',
    700: '21 128 61',
    800: '22 101 52',
    900: '20 83 45',
  },
  // 3. Índigo Profissional (#4F46E5)
  '#4f46e5': {
    50: '238 242 255',
    100: '224 231 255',
    200: '199 210 254',
    300: '165 180 252',
    400: '129 140 248',
    500: '99 102 241',
    600: '79 70 229',
    700: '67 56 202',
    800: '55 48 163',
    900: '49 46 129',
  },
  // 4. Laranja Premium (#EA580C)
  '#ea580c': {
    50: '255 247 237',
    100: '255 237 213',
    200: '254 215 170',
    300: '253 186 116',
    400: '251 146 60',
    500: '249 115 22',
    600: '234 88 12',
    700: '194 65 12',
    800: '154 52 18',
    900: '124 45 18',
  },
  // 5. Preto Grafite (#18181B)
  '#18181b': {
    50: '250 250 250',
    100: '244 244 245',
    200: '228 228 231',
    300: '212 212 216',
    400: '161 161 170',
    500: '113 113 122',
    600: '39 39 42',
    700: '24 24 27',
    800: '18 18 20',
    900: '9 9 11',
  },
  // 6. Roxo Detailing (#9333EA)
  '#9333ea': {
    50: '250 255 255',
    100: '243 232 255',
    200: '233 213 255',
    300: '216 180 254',
    400: '192 132 252',
    500: '168 85 247',
    600: '147 51 234',
    700: '126 34 206',
    800: '107 33 168',
    900: '88 28 135',
  },
};

// Helper: Convert Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

// Helper: Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

// Helper: Convert HSL to RGB triplet string "R G B"
function hslToRgbTriplet(h: number, s: number, l: number): string {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);

  return `${R} ${G} ${B}`;
}

// Generate complete shades for any arbitrary custom hex color
export function generateColorShades(hexColor: string): ColorShades {
  const normalized = (hexColor || '#2563EB').toLowerCase().trim();
  
  if (PRESET_THEME_PALETTES[normalized]) {
    return PRESET_THEME_PALETTES[normalized];
  }

  const rgb = hexToRgb(normalized);
  if (!rgb) {
    return PRESET_THEME_PALETTES['#2563eb'];
  }

  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    50: hslToRgbTriplet(h, s * 0.95, 0.97),
    100: hslToRgbTriplet(h, s * 0.95, 0.93),
    200: hslToRgbTriplet(h, s * 0.92, 0.85),
    300: hslToRgbTriplet(h, s * 0.90, 0.74),
    400: hslToRgbTriplet(h, s * 0.90, 0.62),
    500: hslToRgbTriplet(h, s, 0.50),
    600: `${rgb.r} ${rgb.g} ${rgb.b}`, // use exact hex color as primary 600
    700: hslToRgbTriplet(h, s * 0.95, 0.35),
    800: hslToRgbTriplet(h, s * 0.95, 0.26),
    900: hslToRgbTriplet(h, s * 0.95, 0.17),
  };
}

// Apply the primary color theme to the DOM root in real-time
export function applyPrimaryTheme(hexColor: string) {
  if (typeof document === 'undefined') return;
  
  const shades = generateColorShades(hexColor);
  const root = document.documentElement;

  root.style.setProperty('--color-primary-50-rgb', shades[50]);
  root.style.setProperty('--color-primary-100-rgb', shades[100]);
  root.style.setProperty('--color-primary-200-rgb', shades[200]);
  root.style.setProperty('--color-primary-300-rgb', shades[300]);
  root.style.setProperty('--color-primary-400-rgb', shades[400]);
  root.style.setProperty('--color-primary-500-rgb', shades[500]);
  root.style.setProperty('--color-primary-600-rgb', shades[600]);
  root.style.setProperty('--color-primary-700-rgb', shades[700]);
  root.style.setProperty('--color-primary-800-rgb', shades[800]);
  root.style.setProperty('--color-primary-900-rgb', shades[900]);
  root.style.setProperty('--primary-brand-color', hexColor);
}
