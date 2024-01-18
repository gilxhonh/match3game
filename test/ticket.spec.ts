import * as fs from "fs";
import * as path from "path";
import { strict as assert } from "assert";
import { proof } from "@gdk/croupier";
import proxyquire from "proxyquire";
import { GameConfReader } from "@gdk/backutils";
import type { ICroupier } from "@gdk/backutils";

import type * as TicketModule from "../src/ticket";

// import ticket with proxyquire because gamekit cannot be included in node environnement
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const ticket = proxyquire.noCallThru().load("../src/ticket", {
	"@gdk/gamekit": {
		Ticket: function () {
			/* empty */
		},
	},
}) as typeof TicketModule;

describe("Ticket class", () => {
	it(`fails on wrong symbols`, () => {
		proof("empty symbol is not valid", /TicketError/, "")(ticket.parse);
		proof("random string", /TicketError/, "azerty")(ticket.parse);
	});

	const dealers = extractDealerFiles().map((file) => readJson(file) as ICroupier);
	for (const dealer of dealers) {
		it(`can parse every ticket in dealer "${dealer.code}" without error`, () => {
			for (const rank of dealer.ranks) {
				for (const { symbol } of rank.tickets ?? []) {
					assert.doesNotThrow(() => {
						ticket.parse(symbol);
					}, `parsing of symbol "${symbol}" should not fail`);
				}
			}
		});
	}
});

function extractDealerFiles(): string[] {
	const { games } = readJson("./package.json") as { [game: string]: string };
	const configFiles: string[] = Array.from(new Set(Object.values(games)));
	const dealers: string[] = [];

	for (const configFile of configFiles) {
		const config = new GameConfReader(
			path.resolve(__dirname, "../../", path.dirname(configFile)),
			path.basename(configFile)
		);

		// const config = configFile.endsWith(".ts")
		// 	? require(path.join(__dirname, "../", configFile.replace(".ts", ".js")))
		// 	: (readJson(configFile) as any);
		//const services: Record<string, string> = config.gameDescription?.assets?.services;
		//if (services !== undefined) {
		dealers.push(...Object.values(config.services).filter(isDealerFile));
		//}
	}
	return dealers;
}

function isDealerFile(file: string): boolean {
	return file.endsWith(".json");
}

function readJson(jsonPath: string): unknown {
	return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as unknown;
}
