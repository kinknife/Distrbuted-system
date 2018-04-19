const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: './client/index.jsx',
        vendor: ['react', 'react-dom']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[hash].js',
    },
    context: __dirname,
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.resolve(__dirname, './client')
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'less-loader']
				})
			},
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader'
				})
            },
            {
				test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
				loader: 'file-loader',
				query: {
					name: 'assets/[hash].[ext]',
					publicPath: '/'
				}
			}
        ]
    },
    resolve: {
        modules: [
          "node_modules",
          path.resolve(__dirname, "client")
        ],
        extensions: [".js", ".json", ".jsx", ".css", ".html"],
    },
    plugins: [
        new CleanWebpackPlugin('dist', {
			verbose: true
		}),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['vendor'],
            minChunks: Infinity
        }),
        new ExtractTextPlugin({
			filename: 'css/styles.css',
			allChunks: true
        }),
        new HtmlWebpackPlugin({
            template: 'client/index.html'
        }),
    ]
}