import "source-map-support/register";

import express from "express";
import http from "http";
const { Server } = require("socket.io");
import chalk from "chalk";

import { ObservableSocket } from "shared/observable-socket";
import { merge } from "rxjs";

import { UsersModule } from "./modules/users";
import { PlaylistModule } from "./modules/playlist";
import { ChatModule } from "./modules/chat";

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
// Services
const videoServices = [];
const playlistRepository = {};

// -------------------
// Modules
const users = new UsersModule(io);
const chat = new ChatModule(io, users);
const playlist = new PlaylistModule(io, users, playlistRepository, videoServices);
const modules = [users, chat, playlist];


// -------------------
// Socket
io.on("connection", socket => {
	console.log(`Got connection from ${socket.request.connection.remoteAddress}`);

	const client = new ObservableSocket(socket);
	for (let mod of modules)
		mod.registerClient(client);

	for (let mod of modules)
		mod.clientRegistered(client);
});

// -------------------
// Startup
const port = process.env.PORT || 3000;

function startServer() {
	server.listen(port, () => {
		console.log(`Server started on ${port}`);
	});
}

merge(...modules.map(m => m.init$()))
	.subscribe({
		complete() {
			startServer();
		},
		error(error) {
			console.error(`Could not init module: ${error.stack || error}`);
		}
	});