import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default [
  {
    input: 'src/index.js',
    output: {
      format: 'es',
      file: IS_PRODUCTION
        ? 'dist/caniuse-embed-element.min.js'
        : 'dist/caniuse-embed-element.js',
    },
    plugins: [
      IS_PRODUCTION ? terser() : null,
      postcss({
        plugins: [],
      }),
    ],
  },
];
