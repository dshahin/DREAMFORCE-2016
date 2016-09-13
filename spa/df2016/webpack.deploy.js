var webpack = require('webpack');
var copy = require('copy-webpack-plugin');
var path = require('path');
var sfdcdeploy = require('./deploy/deploy');
//var autoprefixer = require('autoprefixer');
//var ngannotate = require('ng-annotate');
//var nginject = require('nginject-loader');
var extractplugin = require('extract-text-webpack-plugin');
//var extractstyle = new extractplugin('assets/[name].css');
// This will make 'assets/app.css' because of the entry name.

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js'],
        alias: {
            'moment': 'moment/moment.js',
            'jquery-ui': 'jquery-ui/jquery-ui.js',
            modules: path.join(__dirname, 'node_modules')
        }
    },
    entry: {
        'app': './src/main.js',
        'vendor': ['angular', 'moment']
    },
    output: {
        path: './dist',
        filename: "bundle.js",
        publicPath: '/'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
        new extractplugin('assets/[name].css'),
        new copy([{
            from: './node_modules/@salesforce-ux/design-system/assets',
            to: './assets'
        }], {
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
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'window.jQuery': 'jquery',
            'jsr' : 'jsr-mocks'
        }),
        new webpack.ProvidePlugin({
            'moment': 'moment'
        }),
        extractplugin,
        new sfdcdeploy({
            path: './dist/',
            name: 'df2016'
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
            loader: extractplugin.extract([
                'css',
                'autoprefixer?browsers=last 2 versions',
                'sass'
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
        noParse: [path.join(__dirname, 'node_modules', 'angular', 'bundles')]
    }
};
