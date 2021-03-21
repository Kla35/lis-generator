const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");
const { promisify } = require("util");

const { JSDOM } = require("jsdom");
const { Context2d } = require("canvas");

function readPlugin(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}
const chartJSPath = path.resolve(
  path.join(path.dirname(require.resolve("chart.js")), "../dist/Chart.min.js")
);
const chartJSSrc = readPlugin(chartJSPath);

// resolve peer dependancy

class ChartJs extends EventEmitter {
  constructor(width = 1000, height = 1000, hardcodedPlugins = []) {
    super();
    this.height = height;
    this.width = width;

    this.loadWindow(hardcodedPlugins);
  }

  loadWindow(hardcodedPlugins) {
    const scripts = [`<script>${chartJSSrc}</script>`];
    for (const pl of hardcodedPlugins) {
      scripts.push(`<script>${readPlugin(pl)}</script>`);
    }
    for (const pluginPath of hardcodedPlugins) {
      const chartJSPath = path.dirname(require.resolve("chart.js"));
      const chartJSSrc = fs.readFileSync(
        `${chartJSPath}/../dist/Chart.min.js`,
        "utf-8"
      );
    }
    const html = `<html>
      <body>
        <div id='chart-div' style='font-size:12; width:${this.width}; height:${
      this.height
    };'>
          <canvas id='myChart' width=${this.width} height=${
      this.height
    }></canvas>
        </div>
      </body>
      ${scripts.join("\n")}
    </html>`;

    const { window } = new JSDOM(html, {
      features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"],
        SkipExternalResources: false
      },
      runScripts: "dangerously"
    });

    this.window = window;
    this.window.CanvasRenderingContext2D = Context2d;
    this.canvas = this.window.document.getElementById("myChart");
    this.ctx = this.canvas.getContext("2d");
  }

  async makeChart(chartConfig) {
    this._chart && this._chart.destroy();

    chartConfig.plugins = chartConfig.plugins || [];
    chartConfig.options = chartConfig.options || {};
    chartConfig.options.responsive = false;
    chartConfig.options.width = 400;
    chartConfig.options.height = 400;
    chartConfig.options.animation = false;

    this.chartConfig = chartConfig;

    return this;
  }

  drawChart() {
    this.emit("beforeDraw", this.window.Chart);

    if (this.chartConfig.options.charts) {
      for (const chart of this.chartConfig.options.charts) {
        this.window.Chart.defaults[chart.type] = chart.defaults || {};
        if (chart.baseType) {
          this.window.Chart.controllers[
            chart.type
          ] = this.window.Chart.controllers[chart.baseType].extend(
            chart.controller
          );
        } else {
          this.window.Chart.controllers[
            chart.type
          ] = this.window.Chart.DatasetController.extend(chart.controller);
        }
      }
    }

    this._chart = new this.window.Chart(this.ctx, this.chartConfig);

    return this;
  }

  toBlob(mime) {
    const toBlobRearg = (mime, cb) =>
      this.canvas.toBlob((blob, err) => cb(err, blob), mime);

    return promisify(toBlobRearg)(mime);
  }

  toBuffer(mime = "image/png") {
    return this.toBlob(mime).then(
      blob =>
        new Promise((resolve, reject) => {
          const reader = new this.window.FileReader();

          reader.onload = function() {
            const buffer = Buffer.from(reader.result);
            resolve(buffer);
          };

          reader.readAsArrayBuffer(blob);
        })
    );
  }

  toFile(path, mime = "image/png") {
    const writeFile = promisify(fs.writeFile);

    return this.toBuffer(mime).then(blob => writeFile(path, blob, "binary"));
  }
}

module.exports = ChartJs;
