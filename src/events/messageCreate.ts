import { Message, TextChannel } from "eris";
import Command from "../commands/command";
import { config } from "dotenv";
config();

// * Fired when a message is created in any channel
exports.handler = async function (
	message: Message<TextChannel>
): Promise<void> {
	if (
		message.author.bot ||
		!message.guildID ||
		!message.content.startsWith(process.env.BOT_PREFIX!)
	)
		return;

	let args: string[] = message.content
		.slice(process.env.BOT_PREFIX!.length)
		.toLowerCase()
		.split(" ")
		.map((item: string) => item.trim());

	const commandName: string = args.shift()!;
	const command: Command = this.cmds.find(
		(cmd: Command) =>
			cmd.props.name === commandName || cmd.props.aliases?.includes(commandName)
	);

	if (!command) return;

	let res: any = await command.exec({
		bot: this,
		message,
		args
	});
	if (!res) return;

	if (res instanceof Object) {
		res = {
			content: res.content,
			file: res.file,
			embed: res.embed ? res.embed : res
		};

		if (!res.embed.color) {
			res.embed.color = this.colors.blue;
		}

		if (!res.embed.footer || !res.embed.footer.text) {
			res.embed.footer = this.utils.getFooter(message.author);
		} else {
			res.embed.footer = this.utils.getFooter(
				message.author,
				res.embed.footer.text
			);
		}

		if (!res.embed.timestamp) res.embed.timestamp = new Date();
	}

	message.channel.createMessage(res, res.file).catch(() => {});
};
