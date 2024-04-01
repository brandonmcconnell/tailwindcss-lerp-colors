import chroma from 'chroma-js';
import builtInColors from 'tailwindcss/colors';
function keys(obj) {
    return Object.keys(obj);
}
function entries(obj) {
    return Object.entries(obj);
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
// valid color modes for chroma-js
export const validColorModes = [
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
// default options for tailwind-lerp-colors -> lerpColor
const defaultSingleOptions = {
    lerpEnds: true,
    interval: 25,
    mode: 'lrgb',
};
// default options for tailwind-lerp-colors -> lerpColors
const defaultOptions = {
    includeBase: true,
    includeLegacy: false,
    ...defaultSingleOptions,
};
const isOptionInvalid = (options, optionName, test) => {
    return options && hasOwn(options, optionName) && !test(options[optionName]);
};
const throwError = (message) => {
    throw new Error(message);
};
const isValidShade = (shades) => {
    if (
    // undefined or null
    shades == null ||
        // check if shades is an object
        typeof shades !== 'object' ||
        // check if shades is an array
        Array.isArray(shades) ||
        shades.toString() !== '[object Object]' ||
        !keys(shades).every((key) => {
            return !isNaN(+key);
        })) {
        return false;
    }
    return true;
};
export const lerpColor = (shades, options = {}) => {
    // validate lerpEnds
    if (isOptionInvalid(options, 'lerpEnds', (v) => typeof v === 'boolean'))
        throwError('tailwind-lerp-colors option `lerpEnds` must be a boolean.');
    // validate interval
    if (isOptionInvalid(options, 'interval', (v) => Number.isInteger(v) && typeof v === 'number' && v > 0))
        throwError('tailwind-lerp-colors option `interval` must be a positive integer greater than 0.');
    // validate mode
    if (isOptionInvalid(options, 'mode', (v) => typeof v === 'string' && validColorModes.includes(v)))
        throwError(`tailwind-lerp-colors option \`mode\` must be one of the following values: ${validColorModes.join(', ')}.`);
    if (!isValidShade(shades))
        throwError('tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: ' +
            JSON.stringify(shades, null, 2));
    const { lerpEnds, interval, mode } = {
        ...defaultSingleOptions,
        ...(options !== null && options !== void 0 ? options : {}),
    };
    const sortByNumericFirstIndex = ([numericKeyA], [numericKeyB]) => {
        return numericKeyA - numericKeyB;
    };
    const shadesArray = entries(shades)
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
    // validate includeBase
    if (isOptionInvalid(options, 'includeBase', (v) => typeof v === 'boolean'))
        throwError('tailwind-lerp-colors option `includeBase` must be a boolean.');
    // validate includeLegacy
    if (isOptionInvalid(options, 'includeLegacy', (v) => typeof v === 'boolean'))
        throwError('tailwind-lerp-colors option `includeLegacy` must be a boolean.');
    const legacyNames = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'];
    const { includeBase, includeLegacy, lerpEnds, interval, mode } = {
        ...defaultOptions,
        ...options,
    };
    const baseColors = {};
    if (includeBase) {
        const builtInColorKeys = keys(builtInColors);
        for (const key of builtInColorKeys) {
            if (!legacyNames.includes(key) || includeLegacy) {
                baseColors[key] = builtInColors[key];
            }
        }
    }
    const initialColors = entries({
        ...baseColors,
        ...colorsObj,
    });
    const finalColors = {};
    for (const [name, shades] of initialColors) {
        finalColors[`${name}`] = shades;
        // some shades from tailwind base colors are not objects;
        // skip those
        if (!isValidShade(shades)) {
            continue;
        }
        finalColors[name] = lerpColor(shades, { lerpEnds, interval, mode });
    }
    return finalColors;
};
