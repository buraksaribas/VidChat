const path = require("path");
const fs = require("fs");

const ESLintPlugin = require("eslint-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");


const nodeModules = fs.readdirSync("./node_modules").filter(d => d != ".bin");
function ignoreNodeModules({ context, request }, callback) {
	if (request[0] == ".")
		return callback();

	const module = request.split("/")[0];
	if (nodeModules.indexOf(module) !== -1) {
		return callback(null, "commonjs " + request);
	}

	return callback();
}

module.exports = function createConfig(isDebug) {
	const plugins = [new ESLintPlugin()];

	// --------------------
	// WEBPACK CONFIG
	return {
		mode: isDebug ? "development" : "production",
		target: "node",
		devtool: "source-map",
		entry: "./src/server/server.js",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "server.js"
		},
		resolve: {
			alias: {
				shared: path.resolve(__dirname, "src", "shared")
			}
		},
		module: {
			rules: [
				{
					test: /\.m?js$/,
					exclude: /node_modules/,
					loader: "babel-loader",
				}
			]
		},
		externals: [ignoreNodeModules],
		plugins: plugins,
		optimization: {
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