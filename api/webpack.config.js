const fs = require("fs");
const path = require("path");
const glob = require("glob");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");

const entries = glob
  .sync("./lambdas/**/*.ts")
  .filter((file) => !file.endsWith(".test.ts"));

const entryPoints = entries.reduce((entries, file) => {
  const entry = path.basename(file, path.extname(file));
  entries[entry] = file;
  return entries;
}, {});

/* Extract configuration for use by Terraform */
let config = {};
entries.forEach((entry) => {
  const lambdaName = path.basename(path.dirname(entry));
  const filePath = path.dirname(entry);
  const configFile = fs.readFileSync(
    path.resolve(filePath, "config.json"),
    "utf8"
  );
  config[lambdaName] = JSON.parse(configFile);
});

fs.writeFileSync(
  `${path.resolve(__dirname, "dist")}/config.json`,
  JSON.stringify(config, null, 2)
);

module.exports = {
  entry: entryPoints,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
  },
};
