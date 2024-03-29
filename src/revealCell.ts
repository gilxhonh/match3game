import { Container } from "pixi.js";
import { fromEditor } from "@gdk/core-pixi";
import { Amount } from "@gdk/core";
import type { IAmount } from "@gdk/core";
import type { TextField } from "@gdk/core-pixi";
import type { SpineTimelineButton } from "@gdk/core-pixi/spine2/button";
import type { SpineTimeline } from "@gdk/core-pixi/spine2/timeline";

import * as utils from "./utils";

// TO BE COMPLETED
const RANK_TO_FACTOR: { [rank: string]: number } = {
	A: 1000,
	B: 1,
};

export class RevealCell extends Container {
	@fromEditor("amount")
	public amount!: TextField;

	@fromEditor("symbol")
	public symbol!: SpineTimelineButton;

	protected _revealed = false;
	protected _winning = false;

	public onLoaded(): void {
		const backFx: SpineTimeline = this.symbol
			.getSlotContainerByName("slotBack")
			.getChildByName("backFx");

		//remove all listners
		this.removeAllListeners();

		//reset backFx visibility
		backFx.visible = false;

		// TO BE COMPLETED
		this.on("pointertap", () => {
			void this.reveal(true);
			void utils.fadeOut(backFx);
		});

		this.on("mouseover", () => {
			if (!this.revealed) {
				backFx.visible = true;
				backFx.timeScale = 3;
				void utils.fadeIn(backFx);
				void backFx.playDirect("overEnter", false).then(() => {
					void backFx.playDirect("overIdle", true);
				});
			} else {
				this.locked = true;
			}
		});

		this.on("mouseout", () => {
			void utils.fadeOut(backFx);
		});
	}

	public get revealed(): boolean {
		return this._revealed;
	}

	public get winning(): boolean {
		return this._winning;
	}

	public set locked(locked: boolean) {
		this.interactive = this.buttonMode = !locked;
	}

	public get locked(): boolean {
		return !(this.interactive && this.buttonMode);
	}

	public reset(rank: string, stake: IAmount): void {
		this.skew.set(0, 0);
		this._revealed = false;
		this._winning = false;
		this.locked = false;

		// TO BE COMPLETED: unreveal cell

		this.amount.visible = false;

		//hide cell symbol
		const revealFx: SpineTimeline = this.symbol
			.getSlotContainerByName("slotReveal")
			.getChildByName("reveal");

		revealFx.visible = false;

		// TO BE COMPLETED: load rank data
		this.amount.text = new Amount({
			value: RANK_TO_FACTOR[rank] * stake.value,
			currency: stake.currency,
		}).toString({ minimumFractionDigits: 0 });
	}

	public async reveal(animated: boolean): Promise<void> {
		if (this.revealed) {
			return;
		}

		const revealFx: SpineTimeline = this.symbol
			.getSlotContainerByName("slotReveal")
			.getChildByName("reveal");

		const revealLoseText: TextField = revealFx
			.getSlotContainerByName("textLose")
			.getChildByName("text");

		const revealWinText: TextField = revealFx
			.getSlotContainerByName("textWin")
			.getChildByName("text");

		revealLoseText.text = this.amount.text;
		revealWinText.text = this.amount.text;

		this.emit("reveal", animated);

		this._revealed = true;
		this.locked = true;

		if (!animated) {
			// TO BE COMPLETED: reveal cell WITHOUT animation
			// this.amount.visible = true;
			revealFx.visible = true;
			void revealFx.playDirect("reveal");

			this.emit("revealed", false);
			return;
		}

		// TO BE COMPLETED: reveal cell WITH animations
		// await utils.fadeIn(this.amount);
		revealFx.visible = true;
		void revealFx.playDirect("reveal");

		this.emit("revealed", true);
	}

	public async markAsWinning(): Promise<void> {
		if (this.winning || !this.revealed) {
			return;
		}

		this._winning = true;

		this.parent.addChild(this);

		// TO BE COMPLETED: mark this cell as winning
		await utils.sleep(0);
	}

	public async loosingAnimation(): Promise<void> {
		const revealFx: SpineTimeline = this.symbol
			.getSlotContainerByName("slotReveal")
			.getChildByName("reveal");

		await revealFx.playDirect("revealToLose", false);
	}

	public async winningAnimation(): Promise<void> {
		const revealFx: SpineTimeline = this.symbol
			.getSlotContainerByName("slotReveal")
			.getChildByName("reveal");

		await revealFx.playDirect("revealToWin", false);
		await revealFx.playDirect("winExitFx", false);
	}

	public async enter(delay = 0): Promise<void> {
		// TO BE COMPLETED: cell enter animation
		await utils.fallIn(this, delay);

		const planet: SpineTimeline = this.symbol
			.getSlotContainerByName("slotSymbols")
			.getChildByName("planet");

		void planet.playDirect("idle", true);

		this.locked = false;
	}

	public async exit(delay = 0): Promise<void> {
		await utils.sleep(delay);

		// TO BE COMPLETED: cell exit animation
		await utils.fadeOut(this);
	}
}
