import "./application.scss";
import * as services from "./services";
//import { map } from "rxjs";

// -------------------
// PLAYGROUND
/*
services.server.on$("test").pipe(
	map(d => d + " whoa"))
	.subscribe(item => {
		console.log(`Got ${item} from server!`);
	});

window.setTimeout(() => {
	services.server.status$.subscribe(status => console.log(status));
}, 3000);
*/

services.server.emitAction$("login", { username: "foo", password: "bar" })
	.subscribe(user => {
		console.log("We're logged in: " + user);
	}, error => {
		console.error(error);
	});

// -------------------
// Auth

// -------------------
// Components

// -------------------
// Bootstrap
services.socket.connect();
