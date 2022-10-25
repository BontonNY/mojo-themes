var webpack = require("webpack");
const { generateThemeScreenshots } = require("./scripts/theme-screenshot.js");
const copyfiles = require("copyfiles");
const execa = require("execa");

/**
 * Watch options for the core watcher
 * @type {{files: string[], ignored: string[]}}
 */
var watchOptions = {
  // If files in these directories change, reload the page.
  files: ["/templates", "/lang"],

  //Do not watch files in these directories
  ignored: ["/assets/scss", "/assets/less", "/assets/css", "/assets/dist", "/assets/json"],
};

const copyFontAwesomeWebFontsToAssets = () => {
  return new Promise((resolve) => {
    copyfiles(["./node_modules/@fortawesome/fontawesome-pro/webfonts/*", "./assets/fonts/"], { up: true }, (error) => {
      if (error) console.log(error);
      resolve();
    });
  });
};

/**
 * Watch any custom files and trigger a rebuild
 */
function development() {
  var devConfig = require("./webpack.dev.js");

  // Rebuild the bundle once at bootup
  webpack(devConfig).watch({}, (err, stats) => {
    if (err) {
      console.error(err.message, err.details);
    }

    // console.log(stats.toString({ all: true, errors: false, colors: true }));

    if (stats.hasErrors()) {
      console.error(stats.toString({ all: false, errors: true, colors: true }));
    }

    if (stats.hasWarnings()) {
      console.error(stats.toString({ all: false, warnings: true, colors: true }));
    }

    process.send("reload");
  });

  copyFontAwesomeWebFontsToAssets();
  generateThemeScreenshots();
}

/**
 * Hook into the `stencil bundle` command and build your files before they are packaged as a .zip
 */
async function production() {
  var prodConfig = require("./webpack.prod.js");

  await execa("node", ["./scripts/release-date.js"]);
  generateThemeScreenshots();
  copyFontAwesomeWebFontsToAssets();

  webpack(prodConfig).run((err, stats) => {
    if (err) {
      console.error(err.message, err.details);
      process.exit(1);
      return;
    }

    if (stats.hasErrors()) {
      console.error(stats.toString({ all: false, errors: true, colors: true }));
      process.exit(1);
      return;
    }

    if (stats.hasWarnings()) {
      console.error(stats.toString({ all: false, warnings: true, colors: true }));
    }

    process.send("done");
  });
}

if (process.send) {
  // running as a forked worker
  process.on("message", (message) => {
    if (message === "development") {
      development();
    }

    if (message === "production") {
      production();
    }
  });

  process.send("ready");
}

module.exports = { watchOptions };
