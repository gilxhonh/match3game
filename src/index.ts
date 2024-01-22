import type { State, IAmount, IGameConf } from "@gdk/core";
import { ETicketMode, Express } from "@gdk/gamekit";
import { fromEditor } from "@gdk/core-pixi";

import { Ticket } from "./ticket";
import { Rules } from "./rules";
import { SplashView } from "./splashView";
import { RulesView } from "./rulesView";
import { HomeView } from "./homeView";
import { RevealView } from "./revealView";
import { ResultView } from "./resultView";
import type { CustomConf } from "../default.conf";

const DEFAULT_VIEWS = ["splash", "rules", "home", "reveal", "result"];

export interface NewGameOptions {
	ticket?: Ticket;
	stake?: IAmount;
	demo?: boolean;
}

// eslint-disable-next-line import/no-default-export
export default class Game extends Express<CustomConf> {
	public readonly state: State;

	protected readonly views = {
		splash: new SplashView(),
		rules: new RulesView(),
		home: new HomeView(),
		reveal: new RevealView(),
		result: new ResultView(),
	};

	@fromEditor("rules")
	protected readonly rules: Rules = new Rules();

	protected ticket: null | Ticket = null;
	protected busy = false;

	/**
	 * Constructor
	 * @param gameConfig: the game configuration
	 */
	public constructor(gameConfig: IGameConf) {
		super(gameConfig, window.innerWidth, window.innerHeight, false, {
			autoResize: true,
			transparent: false,
			backgroundColor: 0xff_ff_ff,
		});

		this.state = this.buildState(this.parameters.views ?? DEFAULT_VIEWS);
		this.state.addTransition(this.changeState.bind(this));

		this.views.home.on("play", this.onPlay.bind(this));
		this.rules.on("done", this.onRulesHidden.bind(this));

		// don't wait this call. See home module for more details
		void this.views.home.setStakes(this.config.stakes);
	}

	protected async onPlay(options: NewGameOptions = {}): Promise<void> {
		const ticket = await this.fetchTicket(options);
		await this.setTicket(ticket);

		if (ticket === null) {
			await this.state.to("home");
		} else {
			await this.state.to("reveal");
		}
	}

	public showRules(): Promise<void> {
		super.showRules();

		// show rules component on top
		this.stage.addChild(this.rules);
		return this.rules.enter();
	}

	public hideRules(): Promise<void> {
		super.hideRules();

		// show rules component on top
		this.stage.addChild(this.rules);
		return this.rules.exit();
	}

	public showWinningTable(): void {
		super.showWinningTable();
		// TODO
	}

	protected async setTicket(ticket: null | Ticket): Promise<void> {
		this.ticket = ticket;

		if (ticket !== null) {
			await Promise.all([this.views.reveal.setTicket(ticket), this.views.result.setTicket(ticket)]);
		}
	}

	protected async changeState(currentView: string, nextView: string): Promise<void> {
		switch (currentView) {
			case "rules":
				await this.rules.exit();
				await this.com.bridge.emitEvent("JACKPOT_SHOW_RULES");
				break;
			case "result":
				this.com.bridge.emitEvent("JACKPOT_HIDE_RESULT");
				await this.ticket?.claim();
				break;
		}

		// game end hook
		if (
			this.ticket !== null &&
			["result", "reveal"].includes(currentView) &&
			!["result", "reveal"].includes(nextView)
		) {
			const replayParams = await this.gameEndHook(this.ticket.ticket);
			if (replayParams !== undefined) {
				await this.onPlay(replayParams);
				return;
			}
		}

		switch (nextView) {
			case "splash":
				this.com.bridge.emitEvent("JACKPOT_SHOW_BANNER");
				break;
			case "rules":
				await this.rules.enter();
				this.rules.once("done", () => {
					this.state.next();
				});
				break;
			case "home":
				// reset home ticket when it's claiemd
				if (this.ticket?.status === "CLAIMED") {
					this.ticket = null;
					await this.views.home.setTicket(null);
				}

				this.com.bridge.emitEvent("JACKPOT_SHOW_BANNER", {
					defaultParams: "banner_home",
				});
				break;
			case "reveal":
				// if no home view and no ticket, new bet to get a ticket
				if (currentView !== "home" && this.ticket === null) {
					const ticket = await this.fetchTicket();
					await this.setTicket(ticket);
				}
				// show jackpot banner with reveal skin
				this.com.bridge.emitEvent("JACKPOT_SHOW_BANNER", {
					defaultParams: "banner_reveal",
				});
				break;
			case "result":
				this.com.bridge.emitEvent("JACKPOT_SHOW_BANNER", {
					defaultParams: "banner_result",
				});
				await this.com.bridge.emitEvent("JACKPOT_SHOW_RESULT", {
					betId: this.ticket!.platformBetId,
				});
				break;
		}
	}

	protected async getFirstState(): Promise<string> {
		const ticket = await this.checkExistingTicket();
		await this.setTicket(ticket);

		if (ticket !== null) {
			if (this.parameters.resumeTime === "start") {
				void this.views.home.setTicket(null);
				return "reveal";
			} else {
				this.views.home.setTicket(ticket);
			}
		}

		return this.state.firstKey ?? "";
	}

	protected async fetchTicket(options: NewGameOptions = {}): Promise<null | Ticket> {
		if (this.busy) {
			return null;
		}

		this.busy = true;

		let ticket: null | Ticket = null;

		if (options.ticket !== undefined) {
			ticket = options.ticket;
		} else {
			try {
				const _stake = options.stake ?? this.selectedStake;
				const itgTicket = await this.bet({
					applicationId: "ITG",
					serviceName: this.config.lotteryGameCode,
					stake: {
						value: _stake.value,
						currency: _stake.currency,
					},
					demo: options.demo ?? false,
				});
				ticket = new Ticket(itgTicket, ETicketMode.DEFAULT, this);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(`error when betting`, error);
			}
		}

		this.busy = false;
		return ticket;
	}

	protected async checkExistingTicket(): Promise<null | Ticket> {
		const itgTicket =
			(await this.getTicketToReplay(false)) ??
			(await this.getExistingTicket(this.config.lotteryGameCode, false));

		if (itgTicket !== undefined) {
			const mode = itgTicket.status === "CLAIMED" ? "replay" : "resume";

			if (mode === "resume" && !(await this.resumeHook(itgTicket))) {
				return null;
			}

			const ticket = new Ticket(
				itgTicket,
				mode === "resume" ? ETicketMode.RESUME : ETicketMode.REPLAY,
				this
			);

			return ticket;
		}

		return null;
	}
}
