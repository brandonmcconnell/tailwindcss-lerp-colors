const plugin = require('tailwindcss/plugin');

const interpolateColors = plugin.withOptions(
  () => {}, (options = {}) => {
    function generateLerpedColors({ theme }) {
      const chroma = require('chroma-js');
      const baseColors = require('tailwindcss/colors');
  
      const defaultOptions = {
        includeBaseColors: true,
        includeEnds: true,
        interval: 25,
        mode: 'rgb',
      };
  
      const validColorModes = [
        'rgb', 'lab', 'lch', 'lrgb',
        'hcl', 'num', 'hcg', 'oklch',
        'hsi', 'hsl', 'hsv', 'oklab',
      ];
  
      const sortByNumericFirstIndex = ([numericKeyA], [numericKeyB]) => {
        return numericKeyA - numericKeyB;
      };
  
      const isOptionInvalid = (optionName, test) => {
        return options.hasOwnProperty(optionName) && !test(options[optionName]);
      }

      if (isOptionInvalid('includeBaseColors', v => typeof v === 'boolean'))
        throw new Error('tailwind-lerp-colors option `includeBaseColors` must be a boolean.');
      if (isOptionInvalid('includeEnds', v => typeof v === 'boolean'))
        throw new Error('tailwind-lerp-colors option `includeEnds` must be a boolean.');
      if (isOptionInvalid('interval', v => Number.isInteger(v) && v > 0))
        throw new Error('tailwind-lerp-colors option `interval` must be a positive integer greater than 0.');
      if (isOptionInvalid('mode', v => validColorModes.includes(v)))
        throw new Error(`tailwind-lerp-colors option \`mode\` must be one of the following values: ${validColorModes.map(modeName => '`modeName`').join(', ')}.`);

      const { includeBaseColors, includeEnds, interval, mode } = {
        ...defaultOptions,
        ...options,
      };
      const initialColors = Object.entries({
        ...(includeBaseColors ? baseColors : {}),
        ...theme.colors,
        ...theme.extend.colors,
      });
  
      const finalColors = {};

      for (const [name, shades] of initialColors) {
        if (
          ['null', 'undefined'].includes(typeof shades) ||
          !shades.toString
        ) {
          continue;
        }
        finalColors[name] = shades;
        if (
          typeof shades === 'string' ||
          Array.isArray(shades) ||
          shades.toString() !== '[object Object]' ||
          !Object.keys(shades).every(key => {
            return !isNaN(key);
          })
        ) {
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

      return finalColors;
    }
    
    return {
      theme: {
        extend: {
          colors: generateLerpedColors
        }
      }
    };
  }
);

module.exports = interpolateColors;