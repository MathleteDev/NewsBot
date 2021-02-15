import { Master } from "eris-sharder";
import { config } from "dotenv";
config();

// * Main file
const _ = new Master(process.env.BOT_TOKEN!, "/dist/main.js", {
	stats: true,
	name: "NewsBot",
	clientOptions: {
		messageLimit: 0
	}
});
