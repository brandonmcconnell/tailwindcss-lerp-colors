const chroma = require('chroma-js');
const plugin = require('tailwindcss/plugin');

const defaultOptions = {
  includeEnds: true,
  interval: 25,
  mode: 'rgb',
};

const validColorModes = [
  'rgb',
  'lrgb',
  'lab',
  'lch',
  'hcl',
  'num',
  'hcg',
  'hsi',
  'hsl',
  'hsv',
  'oklab',
  'oklch'
];

const sortByNumericFirstIndex = ([numericKeyA], [numericKeyB]) => {
  return numericKeyA - numericKeyB;
};

const finalColors = {};

const interpolateColors = plugin.withOptions(
  (options = defaultOptions) => (
    function ({ theme }) {
      if (options !== defaultOptions) {
        if (typeof options?.includeEnds !== 'boolean') {
          throw new Error('tailwind-lerp-colors option `includeEnds` must be a boolean.');
        }
        if (
          typeof options?.interval !== 'number' ||
          !Number.isInteger(options.interval)
        ) {
          throw new Error('tailwind-lerp-colors option `interval` must be a positive integer.');
        }
        if (!validColorModes.includes(options?.mode)) {
          throw new Error(`tailwind-lerp-colors option \`mode\` must be one of the following values: ${validColorModes.map(modeName => '`modeName`').join(', ')}.`);
        }
      }
      const {
        includeEnds = defaultOptions.includeEnds,
        interval = defaultOptions.interval,
        mode = defaultOptions.mode,
      } = options ?? defaultOptions;
      const initialColors = Object.entries(theme('colors'));

      for (const [name, shades] of initialColors) {
        if (
          ['null', 'undefined'].includes(typeof shades) ||
          !shades.toString
        ) {
          continue;
        }
        if (
          typeof shades === 'string' ||
          Array.isArray(shades) ||
          shades.toString() !== '[object Object]' ||
          !Object.keys(shades).every(key => {
            return !isNaN(key);
          })
        ) {
          finalColors[name] = shades;
          continue;
        }
        const shadesArray = (
          Object.entries(shades)
            .map(([numericStringKey, color]) => {
              return [Number(numericStringKey), color];
            })
            .sort(sortByNumericFirstIndex)
        );
        if (includeEnds) {
          shadesArray.unshift([0, '#ffffff']);
          shadesArray.push([1000, '#000000']);
        }
        const finalShades = [...shadesArray];
        for (let i = 0; i < shadesArray.length - 1; i++) {
          const [shade, color] = shadesArray[i];
          const [nextShade, nextColor] = shadesArray[i + 1];

          // check to make sure both shades being compared	
          // are evenly divisible by the set interval
          let interpolations = (nextShade - shade) / interval - 1;
          if (
            interpolations <= 0 ||
            !Number.isInteger(interpolations)
          ) continue;

          const scale = chroma.scale([color, nextColor]).mode(mode);
          const getColorAt = percent => scale(percent).hex();
          for (let run = 1; run <= interpolations; run++) {
            const percent = run / (interpolations + 1);
            finalShades.push([
              shade + (interval * run),
              getColorAt(percent)
            ]);
          }
        }
        finalShades.sort(sortByNumericFirstIndex);
        finalColors[name] = Object.fromEntries(finalShades)
      }
    }
  ), () => (
    {
      theme: {
        extend: {
          colors: {
            ...finalColors
          }
        }
      }
    }
  )
);

module.exports = interpolateColors;