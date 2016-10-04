var webpack = require('webpack');
var copy = require('copy-webpack-plugin');
var path = require('path');
var extractplugin = require('extract-text-webpack-plugin');


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
        function () {
            this.plugin("done", function (stats) {
                if (stats.compilation.errors && stats.compilation.errors.length) {
                    console.log(stats.compilation.errors);
                    process.exit(1);
                }
            });
        },
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
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
            'window.jQuery': 'jquery'
        }),
        new webpack.ProvidePlugin({
            'moment': 'moment'
        }),
        extractplugin,
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
