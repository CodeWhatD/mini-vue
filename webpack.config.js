const { resolve,join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: "./src/index.js",
  output: {
    filename: 'build.js',
    path:resolve(__dirname,"build"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename:'app.html',
      inject:'body'
    }),
  ],
  devServer: {
    static: {
      directory: join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
  mode:'development',
}