import { Emoji, Message, TextChannel } from "eris";
import { EventEmitter } from "events";
import { setTimeout } from "timers";

type Filter = (userID: string, emoji: Emoji) => boolean;

interface Options {
	idle: number;
}

// * Used to log / filter reactions
export default class ReactionHandler {
	private listeners: Record<string, ReactionCollector> = {};

	public awaitReactions(
		message: Message<TextChannel>,
		filter: Filter,
		options: Options
	): ReactionCollector {
		delete this.listeners[message.id];

		let collector = new ReactionCollector(filter, options);
		collector.on("end", (): boolean => delete this.listeners[message.id]);
		this.listeners[message.id] = collector;

		return collector;
	}

	public collect(
		message: Message<TextChannel>,
		userID: string,
		emoji: Emoji
	): void {
		if (!this.listeners[message.id]) return;
		this.listeners[message.id].collect(userID, emoji);
	}
}

export class ReactionCollector extends EventEmitter {
	private filter: Filter;
	private ended: boolean = false;
	private idle: NodeJS.Timeout;
	private options: Options;

	public constructor(filter: Filter, options: Options) {
		super();

		this.filter = filter;
		this.options = options;
		this.idle = setTimeout((): void => this.stop("idle"), options.idle);
	}

	public collect(userID: string, emoji: Emoji): void {
		if (!this.filter(userID, emoji) || this.ended) return;

		this.emit("collect", userID, emoji);

		clearTimeout(this.idle);
		this.idle = setTimeout((): void => this.stop("idle"), this.options.idle);
	}

	public stop(reason: string): void {
		if (this.ended) return;
		this.ended = true;

		clearTimeout(this.idle);

		this.emit("end", reason);
		this.removeAllListeners();
	}
}
