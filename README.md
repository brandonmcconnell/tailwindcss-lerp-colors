<h1 align="center">Tailwind Lerp Colors</h1>

<div align="center"><b>&#8220;Lerp&#8221;</b> = <b>(L)</b>inear Int<b>(erp)</b>olation</div><br />

**Tailwind Lerp Colors** programnatically interpolates between any default and extended colors in a Tailwind config for additional color stops (e.g. `red-425`, `gray-950`).

<img src="https://dreamthinkbuild.com/tailwind-lerp-colors/tlc-readme-graphic.png" alt="" width="500" height="auto" /><br />

<blockquote>
  <h4>Table of Contents</h4>
  <ul>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage
      <ul>
        <li><a href="#simple-usage">Simple usage</a></li>
        <li><a href="#advanced-usage">Advanced usage</a></li>
        <li><a href="#options-explained">Options explained</a></li>
      </ul>
    </a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#support">Support</a></li>
    <li><a href="#license">License</a></li>
  </ul>
</blockquote>

<hr />

## Installation
Install the function from npm:
```bash
npm i -D tailwind-lerp-colors
```

Then add the function to your `tailwind.config.js` file. It's recommended to use `tailwind-lerp-colors` in `theme.colors` and NOT `theme.extend.colors` as the function will only interpolate colors passed into its object, and using `theme.extend.colors` generally implies you're relying on leaving `theme.colors` as-is to keep the standard Tailwind colors. That route, the standard colors would not be interpolate dalong with your custom colors.

As a convenience, there is a `includeBase` property which can be passed into the `options` (though it's enabled by default) which automate importing Tailwind's base colors, so you do not need to pass them in manually. 
As a convenience, there is a `includeBase` property which can be passed into the `options` (though it's enabled by default) which automatically imports Tailwind's base colors so you don't need to pass them in manually.

Also, if you rely on some of Tailwind's legacy color names (`lightBlue`, `warmGray`, `trueGray`, `coolGray`, `blueGray`), you can enable the `includeLegacy` property by setting it to `true` to include those legacy colors as well, though it's recommended by the Tailwind team to alias those legacy color names directly in your Tailwind config and not rely on Tailwind's `require('tailwindcss/colors')` to add those for you, as that will produce a warning. More info on that can be found on the offical Tailwind CSS website [here](https://tailwindcss.com/docs/upgrade-guide#renamed-gray-scales).

If you want to interpolate a group of named colors, use the `lerpColors` (plural) function like this:
```js
// tailwind.config.js
const { lerpColors } = require('tailwind-lerp-colors');

module.exports = {
  theme: {
    colors: lerpColors({
      coral: coralShades,
    }, {
      // function options (all optional)
      includeBase: true,
      includeLegacy: false,
      lerpEnds: true,
      interval: 25,
      mode: 'lrgb',
    })
  },
}
```

If you want to interpolate a single color, use the `lerpColor` (singular) function like this:
```js
// tailwind.config.js
const { lerpColor } = require('tailwind-lerp-colors');

module.exports = {
  theme: {
    colors: {
      coral: lerpColor(coralShades, {
        lerpEnds: true,
        interval: 25,
        mode: 'lrgb',
      }),
    }
  },
}
```

ℹ️ One important distinction here between the options for `lerpColors` and `lerpColor` is that `includeBase` and `includeLegacy` are not available for `lerpColor` as it's only interpolating a single color, so there's no need to include the base colors.

## Usage
`tailwind-lerp-colors` works without using any options, so if you're good with the default options (listed below in the "Advanced usage" example), this should work for you:

### Simple usage:
```js
// tailwind.config.js
theme: {
  colors: lerpColors({
    // your colors
  })
}
```

Alternatively, if you want more flexibility, you can invoke the `tailwind-lerp-colors` function with an options object.

### Advanced usage:
```js
// tailwind.config.js
theme: {
  colors: lerpColors({
    // your colors
  }, {
    // function options (all optional)
    includeBase: true,
    includeLegacy: false,
    lerpEnds: true,
    interval: 25,
    mode: 'lrgb',
  })
}
```

The values listed above are all the options currently supported and their default values. Using the above would render the exact same result as the simple usage listed prior.

Every option in the options object is entirely optional and falls back to its respective default option when omitted.

#### Options explained:
* `includeBase` (`boolean`) determines whether or not to include Tailwind's base colors in the interpolation and final colors. In Tailwind v3.x, all Tailwind base colors are enabled by default for use with the JIT compiler.
  
  This setting follows the same methodology and includes all Tailwind base colors in the interpolation of your colors, even if they are not explicitly listed in your Tailwind config. When this option is enabled, the base colors are included at a lower priority, so any colors of the same name you list in your Tailwind config will still override the base colors as they normally would.

  If this setting is disabled, the function will only interpolate colors explicitly listed in your Tailwind config.

* `includeLegacy` (`boolean`) will include Tailwind's legacy color names (`lightBlue`, `warmGray`, `trueGray`, `coolGray`, `blueGray`) in the final colors output by `tailwind-lerp-colors`. As mentioned above, it's recommended by the Tailwind team to alias those legacy color names directly in your Tailwind config and not rely on Tailwind's `require('tailwindcss/colors')` to add those for you, as that will produce a warning. More info on that can be found on the offical Tailwind CSS website [here](https://tailwindcss.com/docs/upgrade-guide#renamed-gray-scales).
  
  ** *`includeBase` must be set to true in order for `includeLegacy` to work*

* `lerpEnds` (`boolean`) will include interpolation past the bounds of the colors included in the provided palette. For example, assuming a color `brown` is included in Tailwind config colors, where `brown-50` is the lightest shade and `brown-900` is the darkest shade, the function—when enabled—would interpolate between white (`#fff`) and `brown-50` and between black (`#000`) and `brown-900` to expose lighter and darker shades of every color than those included in the palette.

* `interval` (`number`, positive integer) sets the interval at which to interpolate colors. For example, with the default value of `25`, between `red-100` and `red-200`, it would interpolate the additional values `red-125`, `red-150`, and `red-175`. To include only the &#8220;halfway&#8221; values and not &#8220;quarter&#8221; values, you could pass an `interval` value of `50` which would only interpolate `red-150` between `red-100` and `red-200`. To interpolate every single value between each shade, you can pass a value of `1`, which would expose `red-101`, `red-102`, `red-103`, …, `red-899` per the default colors (including `red-0` and `red-1000` if `lerpEnds` is enabled).

  It's important to note that each color's default intervals must be evenly divisible by the interval passed in this function, so it's recommended to use a naming convention similar to the one included in Tailwind by default:
  ```
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900
  ```

  If one of your colors uses keys like the aqua example below (`0-9` rather than `50-900`), you'll need to use an interval that divides evenly into those numeric keys, such as `0.25`.
  ```js
  aqua: {
    0: '#eefdf8',
    1: '#cffbeb',
    2: '#a0f5da',
    3: '#66e9c6',
    4: '#31d4ad',
    5: '#12b995',
    6: '#0a9579',
    7: '#0b7763',
    8: '#0d5f50',
    9: '#0e4e43',
  }
  ```

  While using an interval like `25` would not be compatible with a color like the one listed above, rest assured this conflict will neither break the function or your Tailwind config nor even exclude the color. Any color that is found to be incompatible with the `interval` value, whether because of a divisibility issue like in the aqua example above or because the color is a simple string (e.g. `brand-primary: '#c000ff'`), these colors will simply skip the interpolation step and be re-included into the new colors as-is.

* `mode` (`string`, must be value from list, see below) allows you to interpolate using the color mode of your choice for better color interpolation. This helps to avoid gray dead zones (more info on that [here](https://css-tricks.com/the-gray-dead-zone-of-gradients/)). This is especially useful when interpolating between colors of different hues.

  What this means at a larger scale is you can create beautiful palettes of colors using as few as two colors and letting `tailwind-lerp-colors` do the heavy lifting, interpolating between them.

  The accepted values for mode are:
  * `lrgb` (default)
  * `rgb`
  * `lab`
  * `lch`
  * `hcl`
  * `num`
  * `hcg`
  * `oklch`
  * `hsi`
  * `hsl`
  * `hsv`
  * `oklab`

## Roadmap
I have a few improvements planned already, and I am always open to feature requests and bug reports.

Here are some of the features I have planned:

* a `function` option that allows users to more effectively control the rate at which the function interpolates between different colors, which would also allow for better luminosity matching with the base color palettes included in Tailwind

* filtering options, so users can define which colors they do or don't want to interpolate on

* itemized options, so that options can be uniquely set per color

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please run tests where appropriate to help streamline the review and deployment process.

## Support

While you can always support me via [Buy Me a Coffee](https://buymeacoffee.com/brandonmcconnell), the best way to support me and this development is actually to contribute. Every bit of feedback helps me to develop tools the way you as users want them. Thanks!

Also, while I developed this function, much of the ✨magic✨ working behind the scenes runs on Chroma.js, built by [Gregor Aisch](https://github.com/gka) and contributed to by many! Chroma.js is an incredible tool that powers much of the crazy color interactions you see on the web, so definitely pay the [Chroma.js repo](https://github.com/gka/chroma.js) a visit.

## License
[MIT](https://choosealicense.com/licenses/mit/)
