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
      template: "./src/index.html",// 让这个插件基于我们这个src中的index.html为模板，并且引入所有打包之后的资源
      filename:'app.html', // 生成的.html文件叫什么名字
      inject:'body' // 生成的script标签在什么标签里面
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