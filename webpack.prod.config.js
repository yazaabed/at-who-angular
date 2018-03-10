var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/app/at-who.module.js',
    output: {
        library: 'at-who-angular',
        path: path.resolve(__dirname, 'dist'),
        filename: 'at-who-angular.js',
        libraryTarget: 'umd'
    },
    module: {
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
            }
        ]
    },
    externals: {
        'angular': 'umd angular',
        'jQuery': 'umd jquery',
        'jquery': 'umd jquery',
        '$': 'umd jquery',
        '@yazanaabed/dommutationobserver': {
            'commonjs': '@yazanaabed/dommutationobserver',
            'commonjs2': '@yazanaabed/dommutationobserver',
            'amd': 'commonjs2 @yazanaabed/dommutationobserver',
            'root': 'YDomMutationObserver',
        }
    },
    devtool: '#source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new webpack.IgnorePlugin(/^jquery/)
    ]
};
