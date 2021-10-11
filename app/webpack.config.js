const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "index.html" },
      { from: "./src/compensator.html", to: "compensator.html" },
      { from: "./src/consensus.html", to: "consensus.html" },
      { from: "./src/balance.html", to: "balance.html" }]),
  ],
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
