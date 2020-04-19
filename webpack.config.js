const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	node: {
		fs: 'empty',
	},
	entry: {
		'content': './src/content.js',
		'popup': './src/popup.js',
		'background': './src/background/index.js',
		'devtools': './src/devtools.js',
		'devpanel': './src/devpanel/index.js',
		'page': './src/page/index.js'
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: true
						}
					}
				]
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader'
			}
		],
	}
};