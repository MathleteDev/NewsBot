import { Message, TextChannel } from "eris";
import Bot from "../main";

export interface MessageArgs {
	bot: Bot;
	message: Message<TextChannel>;
	args: any[];
}

export interface ParsedArg {
	bot: Bot;
	message: Message<TextChannel>;
	arg: string;
}

export interface CommandArgs {
	name: string;
	aliases?: string[];
	description: Description;
	permissions?: string[];
	args?: Argument[];
}

export interface Description {
	content: string;
	examples: string[];
}

export interface Argument {
	id: string;
	valid?: (arg: ParsedArg) => boolean;
	description?: string;
	required: boolean;
}
