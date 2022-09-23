/* eslint-disable */
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin,
  CleanPlugin = require("clean-webpack-plugin"),
  LodashPlugin = require("lodash-webpack-plugin"),
  path = require("path"),
  fg = require("fast-glob"),
  webpack = require("webpack");

const getReactAppsEntry = () => {
  const files = fg.sync(['./assets/apps/**/*.entry.jsx', './assets/apps/**/*.entry.js']);
  if (files && files.length) {
    return { apps: files }
  }
  return {};
}

// Common configuration, with extensions in webpack.dev.js and webpack.prod.js.
module.exports = {
  bail: true,
  context: __dirname,
  entry: {
    main: "./assets/js/app.js",
    checkout: "./assets/js/simple-checkout.js",
    head_async: ["lazysizes"],
    ...getReactAppsEntry()
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: /(assets\/js|assets\\js|stencil-utils|assets\/apps|assets\\apps)/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              "@babel/plugin-syntax-dynamic-import", // add support for dynamic imports (used in app.js)
              "@babel/plugin-proposal-class-properties", // add support for class properties
              "lodash", // Tree-shake lodash
            ],
            presets: [
              [
                "@babel/preset-env",
                {
                  loose: true, // Enable "loose" transformations for any plugins in this preset that allow them
                  modules: false, // Don't transform modules; needed for tree-shaking
                  useBuiltIns: "usage", // Tree-shake babel-polyfill
                  targets: "> 1%, last 2 versions, Firefox ESR",
                  corejs: "^3.4.1",
                },
              ],
              "@babel/preset-react",
            ],
          },
        },
      }
    ],
  },
  output: {
    chunkFilename: "theme-bundle.chunk.[name].js",
    filename: "theme-bundle.[name].js",
    path: path.resolve(__dirname, "assets/dist"),
  },
  performance: {
    hints: "warning",
    maxAssetSize: 1024 * 300,
    maxEntrypointSize: 1024 * 300,
  },
  plugins: [
    new CleanPlugin(["assets/dist"], {
      verbose: false,
      watch: false,
    }),
    new LodashPlugin(), // Complements babel-plugin-lodash by shrinking its cherry-picked builds further.
    new webpack.ProvidePlugin({
      // Provide jquery automatically without explicit import
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
    // new BundleAnalyzerPlugin({
    //     analyzerMode: 'static',
    //     generateStatsFile: true,
    //     openAnalyzer: false,
    // }),
  ],
  resolve: {
    alias: {
      jquery: path.resolve(__dirname, "node_modules/jquery/dist/jquery.min.js"),
      // jstree: path.resolve(__dirname, 'node_modules/jstree/dist/jstree.min.js'),
      lazysizes: path.resolve(__dirname, "node_modules/lazysizes/lazysizes.min.js"),
      nanobar: path.resolve(__dirname, "node_modules/nanobar/nanobar.min.js"),
      "slick-carousel": path.resolve(__dirname, "node_modules/slick-carousel/slick/slick.min.js"),
      "svg-injector": path.resolve(__dirname, "node_modules/svg-injector/dist/svg-injector.min.js"),
      sweetalert2: path.resolve(__dirname, "node_modules/sweetalert2/dist/sweetalert2.min.js"),
    },
    extensions: [".scss", ".js", ".jsx"],
  },
};
