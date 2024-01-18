import type { TextField } from "@gdk/core-pixi";
import { LoadedView, fromEditor } from "@gdk/core-pixi";
import { Amount } from "@gdk/core";

import type { Ticket } from "./ticket";
import * as utils from "./utils";

export class ResultView extends LoadedView {
	@fromEditor("amount")
	protected amount!: TextField;

	/**
	 * Warning: this method will wait view to be loaded
	 */
	public async setTicket(ticket: Ticket): Promise<void> {
		await this.loaded;

		// TO BE COMPLETED; load ticket data
		this.amount.text = new Amount(ticket.wonAmount).toString();
	}

	public async onDidAppear(): Promise<void> {
		await utils.fadeIn(this);
		await utils.sleep(3000);
		this.emit("done");
	}

	public async onWillDisappear(): Promise<void> {
		await utils.fadeOut(this);
	}
}
