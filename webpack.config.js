'use strict';

const isProduction = process.env.NODE_ENV === 'production';

const webpack = require('webpack');

let babelConfig = 'babel-loader?plugins[]=transform-async-to-generator&plugins[]=transform-es2015-modules-commonjs&presets[]=react';
const entry = ['whatwg-fetch', './src/client/index.js'];

if (isProduction) {
    babelConfig += '&presets[]=es2015';
    entry.unshift('regenerator-runtime/runtime');
}

module.exports = {
    entry: entry,

    output: {
        path: 'public',
        filename: 'bundle.js',
        publicPath: '/'
    },

    plugins: isProduction ? [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ] : [
        new (require('webpack-dashboard/plugin'))
    ],

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: babelConfig },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
        ]
    }
};
