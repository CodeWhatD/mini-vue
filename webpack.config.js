const { resolve,join } = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: 'build.js',
    path:resolve(__dirname,"build"),
  },
  devServer: {
    static: {
      directory: join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
  mode:'development',
}