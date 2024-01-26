import type { TextField } from "@gdk/core-pixi";
import { fromEditor, LoadedView } from "@gdk/core-pixi";
import { Amount } from "@gdk/core";
import type { SpineTimelineButton } from "@gdk/core-pixi/spine2/button";
import type { Container } from "pixi.js";

import type { Ticket } from "./ticket";
import * as utils from "./utils";

export class ResultView extends LoadedView {
	@fromEditor("winContainer.amount")
	protected amount!: TextField;

	@fromEditor("winContainer.fxanimation")
	protected animation!: SpineTimelineButton;

	@fromEditor("winContainer")
	protected winContainer!: Container;

	@fromEditor("loseContainer")
	protected loseContainer!: Container;

	private _winAnimation: boolean = false;

	/**
	 * Warning: this method will wait view to be loaded
	 */
	public async setTicket(ticket: Ticket): Promise<void> {
		await this.loaded;

		// TO BE COMPLETED; load ticket data
		this.amount.text = new Amount(ticket.wonAmount).toString().split(",")[0] + " €";

		this._winAnimation = ticket.wonAmount.value > 0;
	}

	public async onDidAppear(): Promise<void> {
		this.winContainer.visible = false;
		this.loseContainer.visible = false;
		this.amount.visible = false;

		if (this._winAnimation) {
			this.winContainer.visible = true;
			await utils.fadeIn(this);
			this.amount.visible = true;
			void utils.scaleIn(this.amount);
			void this.animation.playDirect("revealToWin", false).then(() => {
				void this.animation.playDirect("multiplierIdleFx", true);
			});
			await utils.sleep(3000);
		} else {
			this.loseContainer.visible = true;
			this.winContainer.visible = false;

			await utils.fadeIn(this);
			await utils.sleep(800);
		}

		this.emit("done");
	}

	public async onWillDisappear(): Promise<void> {
		await this.animation.playDirect("multiplierExitFx", false);
		await utils.fadeOut(this);
	}
}
