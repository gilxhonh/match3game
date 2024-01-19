import { Amount } from "@gdk/core";
import { LoadedView, fromEditor } from "@gdk/core-pixi";
import i18n from "i18next";
import type { IAmount } from "@gdk/core";
import type { Button } from "@gdk/core-pixi";
import type { Sprite } from "pixi.js";

import * as utils from "./utils";
import type { Ticket } from "./ticket";
import AnimatedSprite = PIXI.extras.AnimatedSprite;

export class HomeView extends LoadedView {
	@fromEditor("logo")
	protected logo!: Sprite;
	@fromEditor("playButton")
	protected playButton!: Button;
	@fromEditor("spaceman")
	protected spaceman!: AnimatedSprite;

	// list of play buttons (containing just playButton if set stake was not called
	// or if number of stakes is 1)
	protected stakeButtons: Button[] = [];

	protected resumeButton: undefined | Button;

	public onLoaded(): void {
		this.playButton.on("pointertap", () => {
			this.emit("play");
		});

		this.stakeButtons = [this.playButton];
	}

	public onWillAppear(): void {
		this.playButton.enabled = true;
		this.alpha = 0;
		this.visible = true;
	}

	public async onDidAppear(): Promise<void> {
		await utils.fadeIn(this, 500);
		this.spaceman.play();
	}

	public async onWillDisappear(): Promise<void> {
		await utils.fadeOut(this);
	}

	public onDidDisappear(): void {
		this.visible = false;
	}

	/**
	 * Adapt this view to handle passed stakes as possible stakes.
	 * Will change bet buttons depending on the number of stakes.
	 *
	 * Warning: this method will wait view to be loaded
	 */
	public async setStakes(stakes: IAmount[]): Promise<void> {
		await this.loaded;

		// remove previous stakeButtons
		// just keep playButton hidden because we will clone it
		this.playButton.visible = false;
		for (const button of this.stakeButtons) {
			if (button !== this.playButton) {
				button.destroy();
			}
		}

		// build new button list
		this.stakeButtons = [];
		const w = this.playButton.width;
		const n = stakes.length;
		const margin = 40;
		const spaceBetweenButtons = margin + w;
		let x = -0.5 * (n - 1) * (w + margin);
		for (let i = 0; i < stakes.length; i++) {
			const stake = stakes[i];
			const button = this.playButton.clone() as Button;
			button.name = `playButton_${i}`;
			button.label = stakes.length === 1 ? "PLAY" : `PLAY ${new Amount(stake).toString()}`;
			button.docking.x = x;
			button.on("pointertap", () => {
				this.emit("play", { stake });
			});
			x += spaceBetweenButtons;
			this.stakeButtons.push(button);
		}

		// initlalize buttons
		for (const button of this.stakeButtons) {
			button.visible = true;
			this.addChild(button);
		}
	}

	/**
	 * Warning: this method will wait view to be loaded
	 */
	public async setTicket(ticket: null | Ticket): Promise<void> {
		await this.loaded;

		for (const button of this.stakeButtons) {
			button.visible = ticket === null;
		}

		if (this.resumeButton !== undefined) {
			this.resumeButton.destroy();
			this.resumeButton = undefined;
		}

		if (ticket === null) {
			return;
		}

		const resumeButton = this.playButton.clone() as Button;
		this.resumeButton = resumeButton;
		resumeButton.visible = true;
		resumeButton.label = String(i18n.t("home.resume"));
		resumeButton.on("pointertap", () => {
			this.emit("play", { ticket });
		});
		this.addChild(resumeButton);
	}
}
