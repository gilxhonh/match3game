import type { IGameConfFile } from "@gdk/backutils";

export interface CustomConf {
	views?: string[];
}

export const config: IGameConfFile<CustomConf> = {
	masterGameCode: "boilerplateitg",
	masterGameLabel: "Boilerplate ITG",
	gameProvider: "FDJ",
	gameDescription: {
		numberOfStakes: { min: 1, max: 3 },
		isJackpot: false,
		isConversion: false,
		jackpotCompatible: true,
		demoCompatible: true,
		replayCompatible: true,
		supportedBetModes: ["BET_MANUAL_CLAIM", "BET_AUTO_CLAIM"],
	},
	gameParameters: {
		orientation: "BOTH",
	},
	behavioursParameters: {
		demo: {
			vi: "fdj",
			enablePreBetHook: false,
			enableResumeHook: true,
			enableGameEndHook: false,
			viSkipIntroduction: true,
			views: ["splash", "rules", "home", "reveal", "result", "home"],
		},
		fdj: {
			vi: "fdj",
			enablePreBetHook: false,
			views: ["splash", "rules", "home", "reveal", "result", "home"],
		},
		nt: {
			vi: "fgs_nt",
			views: ["splash", "rules", "home", "reveal", "result", "home"],
		},
		ds: {
			vi: "ds",
			views: ["reveal"],
		},
		ds_custo: {
			vi: "fgs_ds",
			views: ["splash", "rules", "home", "reveal", "result", "home"],
		},
		svs: {
			vi: "svs",
			resumeTime: "never",
			views: ["reveal"],
		},
		lor: {
			vi: "lor",
			views: ["splash", "reveal", "result"],
		},
		szk: {
			vi: "fgs_szk",
			views: ["splash", "rules", "home", "reveal", "result", "home"],
		},
		ees: {
			vi: "fgs_ees",
			views: ["splash", "rules", "home", "reveal", "result", "home"],
		},
		vks: {
			vi: "vks",
			enableGameEndHook: true,
			enableResumeHook: true,
			views: ["home", "reveal", "result", "home"],
		},
	},
	engine: "ITG",
	gameserver: {
		lotteryGameCode: "game-itg",
		services: { "game-itg": "dealers/croupier.json" },
		stakes: [{ value: 1000, currency: "EUR" }],
		demo: { enabled: true, forceAuthentication: false },
		selectedBetMode: "BET_MANUAL_CLAIM",
		selectedTheme: "default",
		selectedLocale: "fr-FR",
		selectedBehaviour: "demo",
	},
};
