var webpack           = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	devtool: 'source-map',
	entry: {
		'index': [ 'babel-core/polyfill.js', './src/index.es6.js' ]
	},
	output: {
		path: './dist',
		filename: '[name].js',
		sourceMapFilename: '[file].map'
	},
	module: {
		loaders: [
			{ test: /\.es6\.js$/, loader: 'babel?compact=false'                     },
			{ test: /\.tag$/,     loader: 'babel?compact=false!imports?riot!riotjs' },
			{ test: /\.png$/,     loader: 'url'                                     }
		]
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new HtmlWebpackPlugin({
			title:    "Time-travel Playground",
			filename: 'index.html'
		})
	]
};
