
var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    background: './src/background/',
    content: './src/content/',
    devtools: './src/devtools/',
    panel: './src/panel/',
    inject: './src/inject/',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
    }],
  },
  resolve: {
    extensions: ['', '.js'],
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '',
    filename: '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: `"${process.env.NODE_ENV}"`,
      },
    }),
  ],
}
