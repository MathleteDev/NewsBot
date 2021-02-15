import { AdvancedMessageContent, Emoji, Message, TextChannel } from "eris";
import Command from "../command";
import { MessageArgs } from "../interfaces";
import get from "axios";
import { Article, News } from "../../misc/newsapi";
import { ReactionCollector } from "../../misc/reactionHandler";
import { config } from "dotenv";
config();

// * Gets news articles from the NewsAPI
module.exports = new Command(
	{
		name: "news",
		description: {
			content: "Get the latest news on a topic!",
			examples: ["ping"]
		},
		permissions: ["sendMessages", "embedLinks"],
		args: [
			{
				id: "topic",
				required: true
			}
		]
	},

	async ({
		bot,
		message,
		args
	}: MessageArgs): Promise<AdvancedMessageContent | void> => {
		const res: any = await get(
			`https://newsapi.org/v2/everything?q=${args.join(" ")}&apiKey=${
				process.env.NEWSAPI_TOKEN
			}`
		).catch(() => {});

		const news: News = res.data;
		if (news.status === "error" || news.totalResults === 0)
			return bot.utils.error("No results found.", message);

		const articles: Article[] = news.articles;
		let page: number = 0;

		let msg: Message<TextChannel> = await message.channel.createMessage({
			embed: {
				title: `📰 News | ${articles[page].title}`,
				url: articles[page].url,
				description: articles[page].description,
				image: { url: articles[page].urlToImage },
				color: bot.colors.blue,
				footer: bot.utils.getFooter(
					message.author,
					`${articles[page].author ? articles[page].author : "N/A"} | ${
						articles[page].source.name
					} | ${page + 1} / ${articles.length}`
				),
				timestamp: new Date()
			}
		});

		msg.addReaction("◀️");
		msg.addReaction("▶️");
		msg.addReaction("🇽");

		const filter: (userID: string, emoji: Emoji) => boolean = (
			userID: string,
			emoji: Emoji
		) =>
			userID === message.author.id && ["◀️", "▶️", "🇽"].includes(emoji.name);

		const collector: ReactionCollector = bot.reactionHandler.awaitReactions(
			msg,
			filter,
			{ idle: 6e4 }
		);

		collector.on("collect", async (userID: string, emoji: Emoji) => {
			if (emoji.name === "▶️") page++;
			else if (emoji.name === "◀️") page--;
			else if (emoji.name === "🇽") return collector.stop("close");

			if (page < 0) page = articles.length - 1;
			else if (page > articles.length - 1) page = 0;

			msg.edit({
				embed: {
					title: `📰 News | ${articles[page].title}`,
					url: articles[page].url,
					description: articles[page].description,
					image: { url: articles[page].urlToImage },
					color: bot.colors.blue,
					footer: bot.utils.getFooter(
						message.author,
						`${articles[page].author ? articles[page].author : "N/A"} | ${
							articles[page].source.name
						} | ${page + 1} / ${articles.length}`
					),
					timestamp: new Date()
				}
			});

			msg.removeReaction(emoji.name, userID);
		});

		collector.on("end", (_: string) => {
			msg.removeReactions();
		});
	}
);
