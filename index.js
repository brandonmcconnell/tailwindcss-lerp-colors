import chroma from 'chroma-js';
import builtInColors from 'tailwindcss/colors';
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
];
const defaultLerpOptions = {
    lerpEnds: true,
    interval: 25,
    mode: 'lrgb',
};
const isOptionInvalid = (options, optionName, test) => {
    return Object.prototype.hasOwnProperty.call(options, optionName) && !test(options[optionName]);
};
const throwError = (message) => {
    throw new Error(message);
};
export const lerpColor = (shades, options = {}) => {
    const defaultOptions = defaultLerpOptions;
    if (isOptionInvalid(options, 'lerpEnds', (v) => typeof v === 'boolean'))
        throwError('tailwind-lerp-colors option `lerpEnds` must be a boolean.');
    if (isOptionInvalid(options, 'interval', (v) => Number.isInteger(v) && typeof v === 'number' && v > 0))
        throwError('tailwind-lerp-colors option `interval` must be a positive integer greater than 0.');
    if (isOptionInvalid(options, 'mode', (v) => typeof v === 'string' && validColorModes.includes(v)))
        throwError(`tailwind-lerp-colors option \`mode\` must be one of the following values: ${validColorModes.join(', ')}.`);
    const { lerpEnds, interval, mode } = {
        ...defaultOptions,
        ...options,
    };
    const sortByNumericFirstIndex = ([numericKeyA], [numericKeyB]) => {
        return numericKeyA - numericKeyB;
    };
    if (['null', 'undefined'].includes(typeof shades) ||
        !shades.toString ||
        typeof shades === 'string' ||
        Array.isArray(shades) ||
        shades.toString() !== '[object Object]' ||
        !Object.keys(shades).every((key) => {
            return !isNaN(+key);
        })) {
        throwError('tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: ' +
            JSON.stringify(shades, null, 2));
    }
    const shadesArray = Object.entries(shades)
        .map(([numericStringKey, color]) => {
        return [Number(numericStringKey), color];
    })
        .sort(sortByNumericFirstIndex);
    if (lerpEnds) {
        shadesArray.unshift([0, '#ffffff']);
        shadesArray.push([1000, '#000000']);
    }
    const finalShades = [...shadesArray];
    for (let i = 0; i < shadesArray.length - 1; i++) {
        const [shade, color] = shadesArray[i];
        const [nextShade, nextColor] = shadesArray[i + 1];
        // check to make sure both shades being compared
        // are evenly divisible by the set interval
        const interpolations = (nextShade - shade) / interval - 1;
        if (interpolations <= 0 || !Number.isInteger(interpolations))
            continue;
        const scale = chroma.scale([color, nextColor]).mode(mode);
        const getColorAt = (percent) => scale(percent).hex();
        for (let run = 1; run <= interpolations; run++) {
            const percent = run / (interpolations + 1);
            finalShades.push([shade + interval * run, getColorAt(percent)]);
        }
    }
    finalShades.sort(sortByNumericFirstIndex);
    return Object.fromEntries(finalShades);
};
export const lerpColors = (colorsObj = {}, options = {}) => {
    const legacyNames = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'];
    const defaultOptions = {
        includeBase: true,
        includeLegacy: false,
        ...defaultLerpOptions,
    };
    if (isOptionInvalid(options, 'includeBase', (v) => typeof v === 'boolean'))
        throwError('tailwind-lerp-colors option `includeBase` must be a boolean.');
    if (isOptionInvalid(options, 'includeLegacy', (v) => typeof v === 'boolean'))
        throwError('tailwind-lerp-colors option `includeLegacy` must be a boolean.');
    const { includeBase, includeLegacy, lerpEnds, interval, mode } = {
        ...defaultOptions,
        ...options,
    };
    const baseColors = {};
    if (includeBase) {
        for (const key of Object.keys(builtInColors)) {
            if (!legacyNames.includes(key) || includeLegacy) {
                baseColors[key] = builtInColors[key];
            }
        }
    }
    const initialColors = Object.entries({
        ...baseColors,
        ...colorsObj,
    });
    const finalColors = {};
    for (const [name, shades] of initialColors) {
        if (['null', 'undefined'].includes(typeof shades) || !shades.toString) {
            continue;
        }
        finalColors[name] = shades;
        if (typeof shades === 'string' ||
            Array.isArray(shades) ||
            shades.toString() !== '[object Object]' ||
            !Object.keys(shades).every((key) => {
                return !isNaN(+key);
            })) {
            continue;
        }
        finalColors[name] = lerpColor(shades, { lerpEnds, interval, mode });
    }
    return finalColors;
};
