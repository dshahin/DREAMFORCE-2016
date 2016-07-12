var webpack = require('webpack');
var slds = require('copy-webpack-plugin');
var path = require('path');
var autoprefixer = require('autoprefixer');
var nginject = require('nginject-loader');
var extractplugin = require('extract-text-webpack-plugin');
var extractstyle = new extractplugin('assets/[name].css');
// This will make 'assets/app.css' because of the entry name.

module.exports = {
  resolve: {
    extensions: ['', '.ts', '.js']
  },
  entry: {
    'app': './src/main.js',
    'vendor': ["angular"]
  },
  output: {
    path: './dist',
    filename: "bundle.js",
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new slds([
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
      })
  ],
  devServer: {
    inline: true,
    contentBase: './dist',
    historyApiFallback: true,
    port: 4444
  },
  devTool: 'source-map',
  module: {
    loaders: [{
        test: /\.scss$/,
        exclude: /(node_modules|bower_components)/,
        loader: extractstyle.extract([
            'css',
            'autoprefixer?browsers=last 2 versions',
            'sass?config=sassLoader'
        ])
    }, {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loaders: ['ng-annotate', 'nginject?deprecate', 'babel-loader?presets[]=es2015']
    }, {
        test: /\.html$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'raw-loader'
    }],
    sassLoader: {
        outputStyle: 'compressed'
    },
    noParse: [ path.join(__dirname, 'node_modules', 'angular', 'bundles') ]
  }
};
