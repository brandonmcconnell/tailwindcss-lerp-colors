/* eslint-disable @typescript-eslint/ban-ts-comment */
import { lerpColor, lerpColors, validColorModes } from '../index';
import defaultTailwindColors from 'tailwindcss/colors';
import { COLOR_MODES_MOCK_DATA } from './__mocks__/mockData';

describe('lerpColor', () => {
  // error handling
  describe('invalid option errors', () => {
    // lerp ends
    test('should throw error if lerpEnds not boolean', () => {
      expect.assertions(1);

      try {
        lerpColor(
          { 100: '#000' },
          {
            // @ts-expect-error
            lerpEnds: 'true',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe('tailwind-lerp-colors option `lerpEnds` must be a boolean.');
      }
    });

    // interval
    test('should throw error if interval not integer', () => {
      expect.assertions(1);

      try {
        lerpColor(
          { 100: '#000' },
          {
            // @ts-expect-error
            interval: '25',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors option `interval` must be a positive integer greater than 0.'
        );
      }
    });

    // interval negative;
    test('should throw error if interval negative', () => {
      expect.assertions(1);

      try {
        lerpColor(
          { 100: '#000' },
          {
            interval: -25,
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors option `interval` must be a positive integer greater than 0.'
        );
      }
    });

    // zero interval
    test('should throw error if interval zero', () => {
      expect.assertions(1);

      try {
        lerpColor(
          { 100: '#000' },
          {
            interval: 0,
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors option `interval` must be a positive integer greater than 0.'
        );
      }
    });

    // mode one of validColorModes
    test('should throw error if mode not one of validColorModes', () => {
      expect.assertions(1);

      try {
        lerpColor(
          { 100: '#000' },
          {
            // @ts-expect-error
            mode: 'invalid',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          `tailwind-lerp-colors option \`mode\` must be one of the following values: ${validColorModes.join(', ')}.`
        );
      }
    });

    // shades should throw error if null
    test('should throw error if shades is not valid object', () => {
      expect.assertions(6);

      try {
        // @ts-expect-error
        lerpColor(null);
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: null'
        );
      }

      try {
        // @ts-expect-error
        lerpColor(undefined);
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: undefined'
        );
      }

      try {
        lerpColor([]);
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: []'
        );
      }

      try {
        lerpColor('string');
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: "string"'
        );
      }
      try {
        // @ts-expect-error
        lerpColor(true);
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: true'
        );
      }

      try {
        // @ts-expect-error
        lerpColor(1);
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: 1'
        );
      }
    });

    // should throw error if object with non-numeric keys
    test('should throw error if shades is object with non-numeric keys', () => {
      expect.assertions(1);

      try {
        // @ts-expect-error
        lerpColor({ 100: '#000', invalid: '#fff' });
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors object `shades` must be an object with numeric keys.\n\nvalue used: {\n  "100": "#000",\n  "invalid": "#fff"\n}'
        );
      }
    });
    test('should not throw error when all valid options', () => {
      expect(() => {
        lerpColor(
          { 100: '#000' },
          {
            lerpEnds: true,
            interval: 25,
            mode: 'rgb',
          }
        );
      }).not.toThrow();
    });
  });

  describe('lerpEnds', () => {
    test('should start #ffffff and end #000000 when lerpEnds: true', () => {
      expect.assertions(4);
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3' },
        {
          lerpEnds: true,
        }
      );

      expect(result[0]).toBe('#ffffff');
      expect(result[100]).toBe('#f1f1f1');
      expect(result[200]).toBe('#f3f3f3');
      expect(result[1000]).toBe('#000000');
    });

    test('should default to initial colors if no lerpEnds', () => {
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3' },
        {
          lerpEnds: false,
        }
      );
      expect(result[0]).toBeUndefined();
      expect(result[100]).toBe('#f1f1f1');
      expect(result[200]).toBe('#f3f3f3');
      expect(result[1000]).toBeUndefined();
    });

    // should lerp from #ffffff to start color correctly
    test('should lerp from #ffffff to start color correctly', () => {
      const result = lerpColor(
        { 100: '#f1f1f1' },
        {
          lerpEnds: true,
        }
      );
      expect(result[0]).toBe('#ffffff');
      expect(result[25]).toBe('#fcfcfc');
      expect(result[50]).toBe('#f8f8f8');
      expect(result[75]).toBe('#f5f5f5');
      expect(result[100]).toBe('#f1f1f1');
    });

    // should lerp from end color to #000000 correctly
    test('should lerp from end color to #000000 correctly', () => {
      const result = lerpColor(
        { 900: '#f1f1f1' },
        {
          lerpEnds: true,
        }
      );
      expect(result[900]).toBe('#f1f1f1');
      expect(result[925]).toBe('#d1d1d1');
      expect(result[950]).toBe('#aaaaaa');
      expect(result[975]).toBe('#797979');
      expect(result[1000]).toBe('#000000');
    });
  });

  describe('interval boundary conditions', () => {
    // should correctly interval for given interval
    test('should add intervals for input interval < minimum interval from input', () => {
      expect.assertions(2);
      const result1 = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3' },
        {
          lerpEnds: false,
          interval: 25,
        }
      );
      expect(Object.keys(result1)).toEqual(['100', '125', '150', '175', '200']);

      // interval 50;
      const result2 = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3' },
        {
          lerpEnds: false,
          interval: 50,
        }
      );
      expect(Object.keys(result2)).toEqual(['100', '150', '200']);
    });

    // should interval correctly for 100;
    test('should not add interval between minimum interval, when input interval = minimum interval', () => {
      expect.assertions(1);
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3', 500: '#f5f5f5' },
        {
          lerpEnds: false,
          interval: 100,
        }
      );
      expect(Object.keys(result)).toEqual(['100', '200', '300', '400', '500']);
    });

    // should interval correctly for greater than 100
    test('should add intervals at >minimum interval gaps, when input interval > minimum input interval', () => {
      expect.assertions(1);
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3', 500: '#f5f5f5' },
        {
          lerpEnds: false,
          interval: 150,
        }
      );
      expect(Object.keys(result)).toEqual(['100', '200', '350', '500']);
    });

    // should not add interval if interval > maximum input interval
    test('should not add intervals anywhere when interval > maximum input interval', () => {
      expect.assertions(1);
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3', 500: '#f5f5f5' },
        {
          lerpEnds: false,
          interval: 600,
        }
      );
      expect(Object.keys(result)).toEqual(['100', '200', '500']);
    });
  });

  describe('interval random testing', () => {
    test(`interval value: 10`, () => {
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3' },
        {
          lerpEnds: false,
          interval: 10,
        }
      );

      expect(Object.keys(result)).toEqual([
        '100',
        '110',
        '120',
        '130',
        '140',
        '150',
        '160',
        '170',
        '180',
        '190',
        '200',
      ]);
    });

    // 25
    test(`interval value: 25`, () => {
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3' },
        {
          lerpEnds: false,
          interval: 25,
        }
      );

      expect(Object.keys(result)).toEqual(['100', '125', '150', '175', '200']);
    });

    // 50
    test(`interval value: 50`, () => {
      const result = lerpColor(
        { 100: '#f1f1f1', 200: '#f3f3f3' },
        {
          lerpEnds: false,
          interval: 50,
        }
      );

      expect(Object.keys(result)).toEqual(['100', '150', '200']);
    });

    // 100
    test(`interval value: 100`, () => {
      const result = lerpColor(
        { 100: '#f1f1f1', 300: '#f3f3f3' },
        {
          lerpEnds: false,
          interval: 100,
        }
      );

      expect(Object.keys(result)).toEqual(['100', '200', '300']);
    });
  });

  describe('modes', () => {
    validColorModes.forEach((mode) => {
      // should correctly lerp for mode
      test(`should lerp for mode ${mode}`, () => {
        COLOR_MODES_MOCK_DATA[mode].forEach((data) => {
          expect(lerpColor(data.input, { mode, lerpEnds: false })).toEqual(data.output);
        });
      });
    });
  });

  describe('option defaulting', () => {
    // should default to lerpEnds: true
    test('should default to lerpEnds: true', () => {
      const result = lerpColor({ 100: '#f1f1f1', 200: '#f3f3f3' });
      expect(result[0]).toBe('#ffffff');
      expect(result[100]).toBe('#f1f1f1');
      expect(result[200]).toBe('#f3f3f3');
      expect(result[1000]).toBe('#000000');
    });

    // should default interval to 25;
    test('should default interval to 25', () => {
      const result = lerpColor({ 100: '#f1f1f1', 200: '#f3f3f3' }, { lerpEnds: false });
      expect(Object.keys(result)).toEqual(['100', '125', '150', '175', '200']);
    });

    // should default mode to lrgb;
    test('should default mode to lrgb', () => {
      const result = lerpColor({ 100: '#f1f1f1', 200: '#f3f3f3' }, { lerpEnds: false, interval: 50 });
      expect(Object.keys(result)).toEqual(['100', '150', '200']);
    });

    // should default to empty object if options undefined
    test('should default to empty object if options undefined', () => {
      const result = lerpColor(COLOR_MODES_MOCK_DATA.lrgb[0].input);
      // does lerping
      expect(result[0]).toBe('#ffffff');
      expect(result[1000]).toBe('#000000');
      expect(result).toMatchObject(COLOR_MODES_MOCK_DATA.lrgb[0].output);
    });

    // should spread empty object when options null;
    test('should spread empty object when options null', () => {
      // @ts-ignore
      const result = lerpColor(COLOR_MODES_MOCK_DATA.lrgb[0].input, null);
      // does lerping
      expect(result[0]).toBe('#ffffff');
      expect(result[1000]).toBe('#000000');
      expect(result).toMatchObject(COLOR_MODES_MOCK_DATA.lrgb[0].output);
    });
  });
});

describe('lerpColors', () => {
  // error handling
  describe('invalid option errors', () => {
    // should throw error if includeBase not boolean
    test('should throw error if includeBase not boolean', () => {
      expect.assertions(1);

      try {
        lerpColors(
          {
            test: {
              100: '#000',
            },
          },
          {
            // @ts-expect-error
            includeBase: 'true',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe('tailwind-lerp-colors option `includeBase` must be a boolean.');
      }
    });

    // throw error if includeLegacy not boolean
    test('should throw error if includeLegacy not boolean', () => {
      expect.assertions(1);

      try {
        lerpColors(
          {
            test: {
              100: '#000',
            },
          },
          {
            // @ts-expect-error
            includeLegacy: 'true',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe('tailwind-lerp-colors option `includeLegacy` must be a boolean.');
      }
    });
    // lerp ends
    test('should throw error if lerpEnds not boolean', () => {
      expect.assertions(1);

      try {
        lerpColors(
          {
            test: {
              100: '#000',
            },
          },
          {
            // @ts-expect-error
            lerpEnds: 'true',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe('tailwind-lerp-colors option `lerpEnds` must be a boolean.');
      }
    });

    // interval
    test('should throw error if interval not integer', () => {
      expect.assertions(1);

      try {
        lerpColors(
          {
            test: {
              100: '#000',
            },
          },
          {
            // @ts-expect-error
            interval: '25',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors option `interval` must be a positive integer greater than 0.'
        );
      }
    });

    // interval negative;
    test('should throw error if interval negative', () => {
      expect.assertions(1);

      try {
        lerpColors(
          {
            test: {
              100: '#000',
            },
          },
          {
            interval: -25,
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors option `interval` must be a positive integer greater than 0.'
        );
      }
    });

    // mode one of validColorModes
    test('should throw error if mode not one of validColorModes', () => {
      expect.assertions(1);

      try {
        lerpColors(
          {
            test: {
              100: '#000',
            },
          },
          {
            // @ts-expect-error
            mode: 'invalid',
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          `tailwind-lerp-colors option \`mode\` must be one of the following values: ${validColorModes.join(', ')}.`
        );
      }
    });

    // zero interval
    test('should throw error if interval zero', () => {
      expect.assertions(1);

      try {
        lerpColor(
          { 100: '#000' },
          {
            interval: 0,
          }
        );
      } catch (e) {
        expect((e as Error).message).toBe(
          'tailwind-lerp-colors option `interval` must be a positive integer greater than 0.'
        );
      }
    });
  });

  const validTailwindColorKeys = Object.keys(defaultTailwindColors);

  const legacyColors = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'];

  // include base
  describe('includeBase', () => {
    // should include tailwind base colors if includeBase: true
    test('should include tailwind base colors if includeBase: true', () => {
      const result = lerpColors(
        {
          test: {
            100: '#000',
          },
        },
        {
          includeBase: true,
          includeLegacy: true,
        }
      );
      expect(Object.keys(result)).toEqual([...validTailwindColorKeys, 'test']);
    });

    // should not include tailwind base colors if includeBase: false
    test('should not include tailwind base colors if includeBase: false', () => {
      expect.assertions(1);
      const result = lerpColors(
        {
          test: {
            100: '#000',
          },
        },
        {
          includeBase: false,
          includeLegacy: true,
        }
      );
      expect(Object.keys(result)).toEqual(['test']);
    });
  });

  // include legacy
  describe('includeLegacy', () => {
    // should include tailwind legacy colors if includeLegacy: true
    test('should include tailwind legacy colors if includeLegacy: true', () => {
      expect.assertions(1);
      const result = lerpColors(
        {
          test: {
            100: '#000',
          },
        },
        {
          includeBase: true,
          includeLegacy: true,
        }
      );
      expect(Object.keys(result)).toEqual([...validTailwindColorKeys, 'test']);
    });

    // should not include tailwind legacy colors if includeLegacy: false
    test('should not include tailwind legacy colors if includeLegacy: false', () => {
      expect.assertions(1);
      const result = lerpColors(
        {
          test: {
            100: '#000',
          },
        },
        {
          includeBase: true,
          includeLegacy: false,
        }
      );

      expect(Object.keys(result)).toEqual(
        [...validTailwindColorKeys, 'test'].filter((color) => !legacyColors.includes(color))
      );
    });
  });

  // lerp ends
  describe('lerpEnds', () => {
    // should do lerpEnds for all colors if lerpEnds: true
    test('should do lerpEnds for all colors if lerpEnds: true', () => {
      const result = lerpColors(
        {
          test1: {
            100: '#f4f4f4',
            200: '#a7a7a7',
          },
          test2: {
            100: '#f5f5f5',
            200: '#dedede',
          },
        },
        {
          lerpEnds: true,
        }
      );

      expect(result.test1).toEqual(
        lerpColor(
          { 100: '#f4f4f4', 200: '#a7a7a7' },
          {
            lerpEnds: true,
          }
        )
      );

      expect(result.test2).toEqual(
        lerpColor(
          {
            100: '#f5f5f5',
            200: '#dedede',
          },
          {
            lerpEnds: true,
          }
        )
      );
    });

    // should start and end from passed colors if lerpEnds: false
    test('should not do lerpEnds of all colors if lerpEnds: false', () => {
      const result = lerpColors(
        {
          test1: {
            100: '#f4f4f4',
            200: '#f5f5f5',
          },
          test2: {
            100: '#f5f5f5',
            300: '#f6f6f6',
          },
        },
        {
          lerpEnds: false,
        }
      );

      expect(result.test1).toEqual(
        lerpColor(
          {
            100: '#f4f4f4',
            200: '#f5f5f5',
          },
          {
            lerpEnds: false,
          }
        )
      );

      expect(result.test2).toEqual(
        lerpColor(
          {
            100: '#f5f5f5',
            300: '#f6f6f6',
          },
          {
            lerpEnds: false,
          }
        )
      );
    });
  });

  // interval
  describe('interval', () => {
    // should use same interval for all colors
    describe('should use same interval for all colors', () => {
      [10, 25, 50, 100].forEach((interval) => {
        test(`test interval value: ${interval}`, () => {
          const result = lerpColors(
            {
              test1: {
                100: '#f4f4f4',
                200: '#f5f5f5',
              },
              test2: {
                100: '#f5f5f5',
                300: '#f6f6f6',
              },
            },
            {
              lerpEnds: false,
              interval,
            }
          );
          expect(Object.keys(result.test1)).toEqual(
            Object.keys(
              lerpColor(
                {
                  100: '#f4f4f4',
                  200: '#f5f5f5',
                },
                {
                  lerpEnds: false,
                  interval,
                }
              )
            )
          );
          expect(Object.keys(result.test2)).toEqual(
            Object.keys(
              lerpColor(
                {
                  100: '#f5f5f5',
                  300: '#f6f6f6',
                },
                {
                  lerpEnds: false,
                  interval,
                }
              )
            )
          );
        });
      });
    });
  });

  // modes
  describe('modes', () => {
    // should use same mode for all colors
    validColorModes.forEach((mode) => {
      test(`should use same mode for all colors if mode: ${mode}`, () => {
        const result = lerpColors(
          {
            test1: COLOR_MODES_MOCK_DATA[mode][0].input,
            test2: COLOR_MODES_MOCK_DATA[mode][1].input,
            test3: COLOR_MODES_MOCK_DATA[mode][2].input,
          },
          {
            lerpEnds: false,
            mode,
            includeBase: false,
          }
        );

        expect(result.test1).toEqual(COLOR_MODES_MOCK_DATA[mode][0].output);
        expect(result.test2).toEqual(COLOR_MODES_MOCK_DATA[mode][1].output);
        expect(result.test3).toEqual(COLOR_MODES_MOCK_DATA[mode][2].output);
      });
    });
  });

  // colors
  describe('invalid formats in colors', () => {
    test('should not skip or modify non-object colors', () => {
      expect.assertions(3);
      const result = lerpColors(
        {
          test: '#000',
          testobj: {
            100: '#ffffff',
            200: '#f1f1f1',
          },
        },
        {
          includeBase: false,
          includeLegacy: false,
          lerpEnds: false,
        }
      );

      expect(result.test).toBe('#000');
      expect(result.testUndefined).toBeUndefined();
      expect(Object.keys(result.testobj)).toEqual(['100', '125', '150', '175', '200']);
    });

    test(`should not modify invalid format colors`, () => {
      const result = lerpColors(
        {
          testInvalid: {
            // @ts-ignore
            testString: '#ffffff',
          },
          testValid: {
            100: '#ffffff',
            200: '#f1f1f1',
          },
        },
        {
          includeBase: false,
          includeLegacy: false,
          lerpEnds: false,
          interval: 50,
        }
      );
      expect(result.testInvalid).toEqual({
        testString: '#ffffff',
      });

      expect(result.testValid).toEqual({
        100: '#ffffff',
        150: '#f8f8f8',
        200: '#f1f1f1',
      });
    });
  });

  // defaulting
  describe('defaulting', () => {
    // should default to includeBase: true
    test('should default to includeBase: true', () => {
      const result = lerpColors(
        {
          test: {
            100: '#ffffff',
            200: '#f1f1f1',
          },
        },
        {
          includeLegacy: false,
        }
      );

      expect(Object.keys(result)).toEqual([...validTailwindColorKeys.filter((v) => !legacyColors.includes(v)), 'test']);
    });
    // shoudl default to includeLegacy: false
    test('should default to includeLegacy: false', () => {
      const result = lerpColors(
        {
          test: {
            100: '#ffffff',
            200: '#f1f1f1',
          },
        },
        {
          includeBase: true,
        }
      );

      expect(Object.keys(result)).toEqual([...validTailwindColorKeys.filter((v) => !legacyColors.includes(v)), 'test']);
    });

    // should default colors to empty object when not passed;
    test('should default colors to empty object when not passed', () => {
      const result = lerpColors(undefined, {
        includeBase: false,
      });

      expect(Object.keys(result)).toEqual([]);
    });

    // should default options to empty object when not passed;
    test('should default options to empty object when not passed', () => {
      const result = lerpColors(
        {
          test: {
            100: '#ffffff',
            200: '#f1f1f1',
          },
        },
        undefined
      );

      expect(Object.keys(result)).toEqual([...validTailwindColorKeys.filter((k) => !legacyColors.includes(k)), 'test']);
    });
  });
});
