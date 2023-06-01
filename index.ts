import chroma, { InterpolationMode } from 'chroma-js'
import builtInColors from 'tailwindcss/colors'

function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

function hasOwn<T extends object>(obj: T, key: keyof T): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

// valid color modes for chroma-js
const validColorModes = [
  'rgb',
  'lab',
  'lch',
  'lrgb',
  'hcl',
  'num',
  'hcg',
  'oklch',
  'hsi',
  'hsl',
  'hsv',
  'oklab',
] as const

// types for tailwind-lerp-colors
type NumericObjKey = number | `${number}`
type Shades = Record<NumericObjKey, string>
type Colors = Record<string, Shades>
type ColorMode = typeof validColorModes[number];
type Options = {
  includeBase?: boolean
  includeLegacy?: boolean
  lerpEnds?: boolean
  interval?: number
  mode?: ColorMode
}
type OptionName = keyof Options;
type Option<T extends OptionName> = Options[T];
type SingularOptions = Pick<Options, 'lerpEnds' | 'interval' | 'mode'>

// default options for tailwind-lerp-colors -> lerpColor
const defaultSingleOptions: Required<SingularOptions> = {
  lerpEnds: true,
  interval: 25,
  mode: 'lrgb',
}

// default options for tailwind-lerp-colors -> lerpColors
const defaultOptions = {
  includeBase: true,
  includeLegacy: false,
  ...defaultSingleOptions,
}

const isOptionInvalid = <T extends OptionName>(
  options: Options,
  optionName: T,
  test: (k: Option<T>) => boolean
) => {
  return options && hasOwn(options, optionName) && !test(options[optionName])
}

const throwError = (message: string) => {
  throw new Error(message)
}

export const lerpColor = (shades: Shades, options: SingularOptions = {}) => {
  if (isOptionInvalid(options, 'lerpEnds', (v) => typeof v === 'boolean'))
    throwError('tailwind-lerp-colors option `lerpEnds` must be a boolean.')

  if (
    isOptionInvalid(
      options,
      'interval',
      (v) => Number.isInteger(v) && typeof v === 'number' && v > 0
    )
  )
    throwError('tailwind-lerp-colors option `interval` must be a positive integer greater than 0.')
  if (isOptionInvalid(options, 'mode', (v) => typeof v === 'string' && validColorModes.includes(v)))
    throwError(
      `tailwind-lerp-colors option \`mode\` must be one of the following values: ${validColorModes.join(
        ', '
      )}.`
    )

  const { lerpEnds, interval, mode } = {
    ...defaultSingleOptions,
    ...(options ?? {}),
  }

  const sortByNumericFirstIndex = (
    [numericKeyA]: [number, string],
    [numericKeyB]: [number, string]
  ) => {
    return numericKeyA - numericKeyB
  }

  if (
    ['null', 'undefined'].includes(typeof shades) ||
    !shades.toString ||
    typeof shades === 'string' ||
    Array.isArray(shades) ||
    shades.toString() !== '[object Object]' ||
    !keys(shades).every((key) => {
      return !isNaN(+key)
    })
  ) {
    throwError(
      'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: ' +
        JSON.stringify(shades, null, 2)
    )
  }
  const shadesArray = entries(shades)
    .map(([numericStringKey, color]) => {
      return [Number(numericStringKey), color] as [number, string]
    })
    .sort(sortByNumericFirstIndex)
  if (lerpEnds) {
    shadesArray.unshift([0, '#ffffff'])
    shadesArray.push([1000, '#000000'])
  }
  const finalShades = [...shadesArray]
  for (let i = 0; i < shadesArray.length - 1; i++) {
    const [shade, color] = shadesArray[i]
    const [nextShade, nextColor] = shadesArray[i + 1]

    // check to make sure both shades being compared
    // are evenly divisible by the set interval
    const interpolations = (nextShade - shade) / interval - 1
    if (interpolations <= 0 || !Number.isInteger(interpolations)) continue

    const scale = chroma.scale([color, nextColor]).mode(mode as InterpolationMode)
    const getColorAt = (percent: number) => scale(percent).hex()
    for (let run = 1; run <= interpolations; run++) {
      const percent = run / (interpolations + 1)
      finalShades.push([shade + interval * run, getColorAt(percent)])
    }
  }
  finalShades.sort(sortByNumericFirstIndex)

  return Object.fromEntries(finalShades)
}

export const lerpColors = (
  colorsObj: Colors = {},
  options: Options = {}
) => {
  const legacyNames = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray']

  if (isOptionInvalid(options, 'includeBase', (v) => typeof v === 'boolean'))
    throwError('tailwind-lerp-colors option `includeBase` must be a boolean.')
  if (isOptionInvalid(options, 'includeLegacy', (v) => typeof v === 'boolean'))
    throwError('tailwind-lerp-colors option `includeLegacy` must be a boolean.')

  const { includeBase, includeLegacy, lerpEnds, interval, mode } = {
    ...defaultOptions,
    ...options,
  }
  const baseColors: Colors = {}
  if (includeBase) {
    const builtInColorKeys = keys(builtInColors);
    for (const key of builtInColorKeys) {
      if (!legacyNames.includes(key) || includeLegacy) {
        baseColors[key] = builtInColors[key]
      }
    }
  }
  const initialColors = entries({
    ...baseColors,
    ...colorsObj,
  })

  const finalColors: Colors = {}

  for (const [name, shades] of initialColors) {
    if (['null', 'undefined'].includes(typeof shades) || !shades.toString) {
      continue
    }
    finalColors[`${name}`] = shades
    if (
      typeof shades === 'string' ||
      Array.isArray(shades) ||
      shades.toString() !== '[object Object]' ||
      !keys(shades).every((key) => {
        return !isNaN(+key)
      })
    ) {
      continue
    }
    finalColors[name] = lerpColor(shades, { lerpEnds, interval, mode })
  }

  return finalColors
}

export type {
  Shades as LerpColorsShades,
  Colors as LerpColorsColors,
  ColorMode as LerpColorsColorMode,
  Options as LerpColorsOptions,
  OptionName as LerpColorsOptionName,
  Option as LerpColorsOption,
  SingularOptions as LerpColorsSingularOptions,
}
