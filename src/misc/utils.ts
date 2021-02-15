import {
	AdvancedMessageContent,
	EmbedFooterOptions,
	Message,
	User
} from "eris";
import Bot from "../main";
import Command from "../commands/command";
import { Argument } from "../commands/interfaces";
import { config } from "dotenv";
config();

// * Commonly used utilities
export default class Utils {
	private bot: Bot;

	public constructor(bot: Bot) {
		this.bot = bot;
	}

	public capitalize = (str: string): string =>
		str
			.split(" ")
			.map((word: string) => word[0].toUpperCase() + word.slice(1))
			.join(" ");

	public strictCapitalize = (str: string): string =>
		str
			.split(" ")
			.map(
				(word: string) => word[0].toUpperCase() + word.slice(1).toLowerCase()
			)
			.join(" ");

	public dashCapitalize = (str: string) =>
		str
			.split("-")
			.map((word: string) => word[0].toUpperCase() + word.slice(1))
			.join(" ");

	public parseCamelCase = (str: string): string =>
		(str[0].toUpperCase() + str.slice(1)).split(/(?=[A-Z])/).join(" ");

	public joinParts(arr: string[]): string {
		const last: string = arr.pop()!;
		if (!arr.length) return last;
		if (arr.length === 1) return `${arr[0]} and ${last}`;
		return `${arr.join(", ")}, and ${last}`;
	}

	public pickRandom = <T>(arr: T[]): T =>
		arr[Math.floor(Math.random() * arr.length)];

	public shuffle<T>(arr: T[]): T[] {
		let tmpArr: T[] = arr;

		for (let i: number = tmpArr.length - 1; i > 0; i--) {
			const j: number = Math.floor(Math.random() * (i + 1));
			[tmpArr[i], tmpArr[j]] = [tmpArr[j], tmpArr[i]];
		}

		return tmpArr;
	}

	public getFooter(user: User, text: string = ""): EmbedFooterOptions {
		return {
			text: `${user.username}${text === "" ? "" : ` | ${text}`}`,
			icon_url: user.dynamicAvatarURL("png")
		};
	}

	public getUsage(command: Command): string {
		if (!command.props.args) return command.props.name;

		return `${command.props.name} ${command.props.args
			.map(
				(arg: Argument) =>
					`${arg.required ? "<" : "["} ${arg.id}${
						arg.description ? `: ${arg.description}` : ""
					} ${arg.required ? ">" : "]"}`
			)
			.join(" ")}`;
	}

	public error(description: string, message: Message): AdvancedMessageContent {
		return {
			embed: {
				title: "⚠️ Error!",
				description,
				color: this.bot.colors.red,
				footer: this.getFooter(message.author),
				timestamp: new Date()
			}
		};
	}

	public getEmbedColor(category: string): string {
		switch (category) {
			default:
				return "red";
			// case "Currency":
			// 	return "green";
			// case "Utilities":
			// 	return "blue";
		}
	}

	public isDev(userID: string): boolean {
		return process.env.BOT_OWNERS!.split(", ").includes(userID);
	}
}
