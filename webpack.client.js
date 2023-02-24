const path = require("path");

const ESLintPlugin = require("eslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const dirname = path.resolve("./");
module.exports = function createConfig(isDebug) {
	const devTool = isDebug ? "eval-source-map" : "source-map";
	const plugins = [new ESLintPlugin()];

	const appEntry = ["./src/client/application.js"];

	if (!isDebug) {
		plugins.push(new MiniCssExtractPlugin());
	} else {
		plugins.push(new webpack.HotModuleReplacementPlugin());
		appEntry.splice(0, 0, "webpack-hot-middleware/client");
	}


	// --------------------
	// WEBPACK CONFIG
	return {
		mode: isDebug ? "development" : "production",
		target: "web",
		devtool: devTool,
		entry: {
			application: appEntry,
		},
		output: {
			path: path.resolve(dirname, "public", "dist"),
			filename: "[name].js",
			publicPath: "/dist/"
		},
		resolve: {
			alias: {
				shared: path.resolve(dirname, "src", "shared")
			}
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					loader: "babel-loader",
					exclude: /node_modules/
				},
				{
					test: /\.(png|jpg|jpeg|gif|woff|tif|eot|svg|woff2)/,
					use: {
						loader: "url-loader",
						options: {
							limit: 512
						}
					}
				},
				{
					test: /\.css$/i,
					use: [
						!isDebug ? MiniCssExtractPlugin.loader : "style-loader",
						"css-loader"
					],
				},
				{
					test: /\.s[ac]ss$/i,
					use: [
						// Creates `style` nodes from JS strings
						!isDebug ? MiniCssExtractPlugin.loader : "style-loader",
						// Translates CSS into CommonJS
						"css-loader",
						// Compiles Sass to CSS
						"sass-loader"
					]
				}
			],
		},
		plugins: plugins,
		/*[
			new ESLintPlugin(),
			//new CleanWebpackPlugin(),
			//new MiniCssExtractPlugin()
		],
		*/
		optimization: {
			splitChunks: {
				chunks: "all",
				name: "vendor"
			},

			minimize: !isDebug ? true : false,
			minimizer: [new TerserPlugin({
				minify: TerserPlugin.uglifyJsMinify,
				// `terserOptions` options will be passed to `uglify-js`
				// Link to options - https://github.com/mishoo/UglifyJS#minify-options
				terserOptions: {},
			})],
		},

	};
	// --------------------
};