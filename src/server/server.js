import "source-map-support/register";

import express from "express";
import http from "http";
const { Server } = require("socket.io");
import chalk from "chalk";


const isDevelopment = process.env.NODE_ENV !== "production";

// -------------------
// Setup
const app = express();
const server = new http.createServer(app);
const io = new Server(server);


// -------------------
// Client Webpack
if (process.env.USE_WEBPACK === "true") {
	const webpackMiddleware = require("webpack-dev-middleware");
	const webpack = require("webpack");
	const webpackHotMiddleware = require("webpack-hot-middleware");
	const clientConfig = require("../../webpack.client");

	const compiler = webpack(clientConfig(true));
	app.use(webpackMiddleware(compiler, {
		publicPath: "/dist/",
		stats: {
			colors: true,
			chunks: false,
			assets: false,
			timings: false,
			modules: false,
			hash: false,
			version: false
		}
	}));

	app.use(webpackHotMiddleware(compiler));
	console.log(chalk.bgRed("Using Webpack Dev Middleware! THIS IS FOR DEV ONLY!"));
}


// -------------------
// Configure Express
app.engine("pug", require("pug").__express);
app.set("view engine", "pug");

app.use(express.static("public"));

const useExternalStyles = !isDevelopment;

app.get("/", (req, res) => {
	res.render("index", {
		useExternalStyles
	});
});

// -------------------
// Modules

// -------------------
// Socket
io.on("connection", socket => {
	console.log(`Got connection from ${socket.request.connection.remoteAddress}`);
});

// -------------------
// Startup
const port = process.env.PORT || 3000;

function startServer() {
	server.listen(port, () => {
		console.log(`Server started on ${port}`);
	});
}

startServer();