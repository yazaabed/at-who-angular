'use strict';

const path    = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin             = require('html-webpack-plugin');
const webpackConfig = {};

const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;

webpackConfig.entry = './src/example/app.js';

webpackConfig.devServer = {
    allowedHosts       : [
        'localhost:8080'
    ],
    compress           : true,
    contentBase        : path.join(__dirname, 'src'),
    historyApiFallback : true,
    hot                : true,
    inline             : true,
    noInfo             : true,
    port               : 8080,
    public             : 'localhost:8080',
    watchContentBase   : true
};

webpackConfig.devtool = 'inline-source-map';

webpackConfig.output = {
    filename   : '[name].min.js',
    path       : path.resolve(__dirname, 'dev'),
    publicPath : '/'
};

webpackConfig.plugins = [
    new HtmlWebpackPlugin({
        hash     : true,
        inject   : 'body',
        template : './src/example/public/index.html'
    }),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        'window.$': 'jquery'
    }),
    new HotModuleReplacementPlugin()
];

webpackConfig.module = {
    rules: [
        {
            test: /\.js$/,
            include: path.resolve(__dirname, 'src/app'),
            exclude: /(node_modules|bower_components|build)/,
            use: {
                loader: 'babel-loader'
            }
        },
        {
            test : /src.*\.js$/,
            use  : [
                {
                    loader : 'ng-annotate-loader'
                },
                {
                    loader : 'babel-loader'
                }
            ]
        },
        {
            test : /src.*\.tpl\.html$/,
            use  : [
                {
                    loader : 'raw-loader'
                }
            ]
        },
        {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        },
        {
            test: /\.(html)$/,
            use: {
                loader: 'html-loader'
            }
        },
        {
            test: require.resolve("jquery.caret"),
            use: "imports-loader?this=>window,define=>false,exports=>false,$=jquery,jQuery=jquery"
        },
        {
            test: require.resolve("at.js"),
            use: "imports-loader?this=>window,define=>false,exports=>false,$=jquery,jQuery=jquery"
        }
    ]
};

module.exports = webpackConfig;
