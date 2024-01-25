import { fromEditor, LoadedView } from "@gdk/core-pixi";
import { ETicketMode } from "@gdk/gamekit";
import type { SpineTimelineButton } from "@gdk/core-pixi/spine2/button";

import * as utils from "./utils";
import { RevealCell } from "./revealCell";
import type { Ticket } from "./ticket";

export class RevealView extends LoadedView {
	@fromEditor("autoButton")
	protected autoButton!: SpineTimelineButton;

	@fromEditor("cell1")
	protected cell1: RevealCell = new RevealCell();
	@fromEditor("cell2")
	protected cell2: RevealCell = new RevealCell();
	@fromEditor("cell3")
	protected cell3: RevealCell = new RevealCell();

	protected ticketToReplay?: Ticket;
	protected autoInProgress = false;
	protected gameOver = false;
	protected animations: Promise<void> = Promise.resolve();

	// TO BE COMPLETED: list of reveal cells
	protected cells: RevealCell[] = [];

	public onLoaded(): void {
		this.cells.push(this.cell1, this.cell2, this.cell3);

		this.autoButton.on("pointertap", () => {
			this.autoButton.enabled = false;
			void this.auto();
		});
	}

	/**
	 * Warning: this method will wait view to be loaded
	 */
	public async setTicket(ticket: Ticket): Promise<void> {
		await this.loaded;

		this.gameOver = false;
		this.autoButton.alpha = 1;
		this.locked = false;

		for (let i = 0, l = this.cells.length; i < l; i++) {
			const cell = this.cells[i];

			// TO BE COMPLETED: display ticket data
			cell.reset(ticket.cells[i], ticket.stake);
			cell.once("reveal", (animated: boolean) => {
				void this.onCellReveal(cell, i, ticket);
			});
			cell.once("revealed", (animated: boolean) => {
				void this.onCellRevealed(cell, i, ticket, animated);
			});
		}

		if (ticket.mode === ETicketMode.RESUME) {
			// TO BE COMPLETED: load ticket.revelationData
			for (const cellIndex of ticket.revelationData.revealed ?? []) {
				void this.cells[cellIndex].reveal(false);
			}
		} else if (ticket.mode === ETicketMode.REPLAY) {
			this.ticketToReplay = ticket;
			this.locked = true;
		}
	}

	protected async onCellReveal(cell: RevealCell, index: number, ticket: Ticket): Promise<void> {
		// gameOver : game will be over soon (last cell is being revealed)
		const gameOver = this.cells.every((c) => c.revealed || c === cell);
		if (gameOver) {
			this.autoButton.enabled = false;
		}
	}

	protected async onCellRevealed(
		cell: RevealCell,
		index: number,
		ticket: Ticket,
		animated: boolean
	): Promise<void> {
		const newAnimations = this.checkWinningCells(cell, index, ticket);
		this.animations = this.animations.then(() => newAnimations);

		await Promise.all([ticket.setRevealed(this.cells.indexOf(cell)), this.animations]);

		await this.checkGameEnd(ticket);
	}

	protected async checkWinningCells(
		revealedCell: RevealCell,
		index: number,
		ticket: Ticket
	): Promise<void> {
		// is there any new winning cells ?
		let highlightedCells: RevealCell[];

		const winningCells: RevealCell[] = ticket.cellsPositions.map((i) => this.cells[i]);

		if (winningCells.includes(revealedCell) && winningCells.every((c) => c.revealed)) {
			highlightedCells = winningCells;
		} else {
			highlightedCells = [];
		}

		if (this.cells.every((c) => c.revealed) && highlightedCells.length === 0) {
			await utils.sleep(300);
			for (const cell of this.cells) {
				void cell.loosingAnimation();
			}
			await utils.sleep(600);
		}

		if (highlightedCells.length > 0) {
			let lastWinningAnimation: void | Promise<void> = Promise.resolve();
			await utils.sleep(300);
			for (const highlightedCell of highlightedCells) {
				lastWinningAnimation = highlightedCell.markAsWinning();
				void highlightedCell.winningAnimation();
			}
			await lastWinningAnimation;
			await utils.sleep(600);
		}
	}

	protected async checkGameEnd(ticket: Ticket): Promise<void> {
		if (this.gameOver) {
			return;
		}
		const gameOver = this.cells.every((c) => c.revealed);

		if (gameOver) {
			await this.onGameEnd(ticket);
		}
	}

	protected async onGameEnd(ticket: Ticket): Promise<void> {
		this.gameOver = true;
		this.autoButton.enabled = false;
		await utils.sleep(2000);
		await utils.fadeOut(this.autoButton);
		this.emit("done");
	}

	protected async auto(cellIndexes?: number[]): Promise<void> {
		if (this.autoInProgress) {
			this.stopAuto();
			return;
		}

		this.locked = true;

		// disable board & bonus cells
		this.autoInProgress = true;

		// if cellIndexes were specified, reveal cells in orders
		if (cellIndexes !== undefined) {
			for (const cellIndex of cellIndexes) {
				if (!this.autoInProgress) {
					return;
				}
				await this.cells[cellIndex].reveal(true);
			}
		}

		// if some cellIndexes were missing in cellIndexes, reveal remaining cells
		for (const cell of this.cells) {
			if (!this.autoInProgress) {
				return;
			}
			await cell.reveal(true);
		}
	}

	protected stopAuto(): void {
		if (!this.autoInProgress) {
			return;
		}

		// re-enable board & bonus cells
		this.locked = false;
		this.autoInProgress = false;
	}

	protected async replay(ticketToReplay: Ticket): Promise<void> {
		this.autoButton.enabled = false;
		await this.auto(ticketToReplay.revelationData.revealed);
	}

	protected set locked(locked: boolean) {
		for (const cell of this.cells) {
			cell.locked = locked;
		}
	}

	public async onWillAppear(): Promise<void> {
		// prepare to enter
		this.visible = false;
		this.autoButton.alpha = 0;
		this.autoButton.enabled = false;

		// cells enter
		let lastCellEnter: Promise<void> = Promise.resolve();
		let delay = 0;
		for (const cell of utils.shuffle(this.cells)) {
			lastCellEnter = cell.enter(delay);
			delay += 100;
		}
		this.visible = true;
		await lastCellEnter;

		// auto button enters
		this.autoButton.enabled = true;
		await utils.fadeIn(this.autoButton);
		this.autoInProgress = false;

		// start replay
		if (this.ticketToReplay) {
			await this.replay(this.ticketToReplay);
		}
	}

	public async onWillDisappear(): Promise<void> {
		let lastCellExit: Promise<void> = Promise.resolve();
		for (const cell of this.cells) {
			lastCellExit = cell.exit();
		}
		await lastCellExit;

		await utils.fadeOut(this);
	}
}
