var webpack = require('webpack');
var copyfiles = require('copy-webpack-plugin');
var path = require('path');
var sfdcdeploy = require('./deploy/deploy');
var openbrowser = require('open-browser-webpack-plugin');
var autoprefixer = require('autoprefixer');

module.exports = {
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  entry: {
    app: './src/main.js',
    vendor: ['angular']
  },
  output: {
    path: './dist',
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new copyfiles([
      { from: './src/faker.min.js', to: './faker.min.js'},
      { from: './src/mocks.js', to: './mocks.js'},
      { from: './node_modules/@salesforce-ux/design-system/assets', to: './assets'},
      ], {
          ignore: [
              'README',
              '*.txt',
              '*.html',
              'fonts/*.ttf',
              'fonts/webfonts/*.svg',
              'fonts/webfonts/*.eot',
              'icons!(-sprite)/*/*.svg',
              'styles/*.css',
              'icons/*/*.png'
          ]
      }),
    new openbrowser({url: 'http://localhost:8888'})
  ],
  devServer: {
    inline: true,
    contentBase: './dist',
    historyApiFallback: true,
    port: 8888
  },
  devTool: 'source-map',
  module: {
    loaders: [{
      test: /\.scss$/,
      exclude: /(node_modules|bower_components)/,
      loaders: [
          'style',
          'css',
          'autoprefixer?browsers=last 2 versions',
          'sass?config=sassLoader'
      ]
    }, {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.html$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'raw-loader'
    }],
    sassLoader: {
        outputStyle: 'compressed'
    },
    noParse: [path.join(__dirname, 'node_modules', 'angular', 'bundles')]
  }
};
