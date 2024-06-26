import { DefaultColors } from 'tailwindcss/types/generated/colors.d.js';
export declare const validColorModes: readonly ["rgb", "lab", "lch", "lrgb", "hcl", "num", "hcg", "oklch", "hsi", "hsl", "hsv", "oklab"];
type Shades = Exclude<Record<string, string> | DefaultColors[keyof DefaultColors], string>;
type Colors = Record<string, Shades | string> | DefaultColors;
type ColorMode = (typeof validColorModes)[number];
type Options = {
    includeBase?: boolean;
    includeLegacy?: boolean;
    lerpEnds?: boolean;
    interval?: number;
    mode?: ColorMode;
};
type OptionName = keyof Options;
type Option<T extends OptionName> = Options[T];
type SingularOptions = Pick<Options, 'lerpEnds' | 'interval' | 'mode'>;
export declare const lerpColor: (shades: Shades, options?: SingularOptions) => {
    [x: string]: string;
};
export declare const lerpColors: (colorsObj?: Colors, options?: Options) => Record<string, string | Shades>;
export type { Shades as LerpColorsShades, Colors as LerpColorsColors, ColorMode as LerpColorsColorMode, Options as LerpColorsOptions, OptionName as LerpColorsOptionName, Option as LerpColorsOption, SingularOptions as LerpColorsSingularOptions, };
