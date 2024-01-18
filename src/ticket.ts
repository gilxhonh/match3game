import { Ticket as GamekitTicket } from "@gdk/gamekit";
import type { ETicketMode, IItgTicket } from "@gdk/gamekit";

import type Game from "./index";

export interface ITicketData {
	// TO BE COMPLETED: data extracted from symbol
	cells: string[];
}

export interface IRevelationData {
	// TO BE COMPLETED: data saved in revelationData
	revealed: number[];
}

export class TicketError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "TicketError";
	}
}

// TO BE COMPLETED: regexp used to parse symbol
const SYMBOL_PATTERN = new RegExp("^" + "([AB],[AB],[AB])" + "$");

/**
 * parse given symbol and extract its information into an object
 *
 * symbol format:
 * winning symbol example:
 * losing symbol example:
 */
export function parse(symbol: string): ITicketData {
	const match = SYMBOL_PATTERN.exec(symbol);

	if (match === null) {
		throw new TicketError(`cannot parse symbol "${symbol}": invalid format`);
	}

	// TO BE COMPLETED
	return {
		cells: match[1].split(","),
	};
}

export class Ticket extends GamekitTicket<IRevelationData, Game> implements ITicketData {
	// TO BE COMPLETED: ticket data are saved here and will be set by parse method
	public readonly cells!: string[];

	public constructor(ticket: IItgTicket, mode: ETicketMode, game: Game) {
		super(ticket, mode, game);
		this.revelationData = this.revelationData ?? { revealed: [] };
	}

	protected parse(): void {
		Object.assign(this, parse(this.symbol));
	}

	/**
	 * Check revelationData validity
	 * Must return true if revelationData format is valid and handled, must return
	 * false otherwise. Parsed symbol data are available at this time
	 * If not implemented in the game it will return false hence revelation data will
	 * be skipped
	 * @param revelationData
	 */
	protected areRevelationDataValid(data: unknown): boolean {
		return Boolean(
			data instanceof Object &&
				data.hasOwnProperty("revealed") &&
				(data as any).revealed instanceof Array &&
				(data as any).revealed.every((v: unknown) => typeof v === "number")
		);
	}

	/**
	 * Notify the ticket that a cell was revealed. Will trigger ticket update
	 * if necessary.
	 *
	 * @param revealedIndex: cell index
	 */
	public setRevealed(revealedIndex: number): void | Promise<void> {
		if (!this.revelationData.revealed.includes(revealedIndex)) {
			this.revelationData.revealed.push(revealedIndex);
			return this.update();
		}
	}
}
