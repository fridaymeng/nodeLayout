/* mode: development or production*/
const path = require('path');

module.exports = {
  // devtool: 'source-map',
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    library: "nodeLayout",
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader"
          }
        ]
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'lib'),
    },
    // hot: true,
    // open: true,
    compress: true,
    port: 9000,
  }
};