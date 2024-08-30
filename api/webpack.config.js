const fs = require("fs");
const path = require("path");
const glob = require("glob");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

fs.rmSync("dist", { recursive: true, force: true });

module.exports = {
  entry: glob
    .sync("./lambdas/**/*.ts")
    .filter((file) => !file.endsWith(".test.ts"))
    .reduce((entries, file) => {
      const entry = path.basename(file, path.extname(file));
      entries[entry] = file;
      return entries;
    }, {}),
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
