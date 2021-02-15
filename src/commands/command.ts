import { AdvancedMessageContent, EmbedOptions, Permission } from "eris";
import { Argument, CommandArgs, MessageArgs } from "./interfaces";

export default class Command {
	public props: CommandArgs;
	public execCommand: (
		messageArgs: MessageArgs
	) => Promise<AdvancedMessageContent | EmbedOptions | string | void>;

	public constructor(
		props: CommandArgs,
		exec: (
			messageArgs: MessageArgs
		) => Promise<AdvancedMessageContent | EmbedOptions | string | void>
	) {
		this.props = props;
		this.execCommand = exec;
	}

	public async exec({
		bot,
		message,
		args
	}: MessageArgs): Promise<
		AdvancedMessageContent | EmbedOptions | string | void
	> {
		const perms: Permission = message.channel.permissionsOf(message.author.id);

		if (this.props.permissions) {
			const req: string[] = this.props.permissions.filter(
				(perm: string) => !perms.has(perm)
			);
			if (req.length > 0) {
				return {
					title: "🔑 Missing Permissions",
					description: req
						.sort()
						.map((perm: string) => `\`${bot.utils.parseCamelCase(perm)}\``)
						.join(" "),
					color: bot.colors.red,
					footer: bot.utils.getFooter(message.author)
				};
			}
		}

		if (this.props.args) {
			for (let i: number = 0; i < this.props.args.length; i++) {
				const arg: Argument = this.props.args[i];
				if (
					(arg.required && !args[i]) ||
					(args[i] && arg.valid && !arg.valid({ bot, message, arg: args[i] }))
				) {
					return {
						title: "🏷️ Invalid Arguments",
						description: `Invalid argument \`${
							arg.id
						}\` of \`${bot.utils.getUsage(this)}\``,
						color: bot.colors.red
					};
				}
			}
		}

		try {
			return this.execCommand({ bot, message, args });
		} catch (error: any) {
			console.log(error);

			return bot.utils.error(error.toString(), message);
		}
	}
}
