import { LoadedView } from "@gdk/core-pixi";

import * as utils from "./utils";

export class SplashView extends LoadedView {
	public async onDidAppear(): Promise<void> {
		await utils.fadeIn(this, 500);
		await utils.sleep(1000);
		this.emit("done");
	}

	public async onWillDisappear(): Promise<void> {
		await utils.fadeOut(this);
	}
}
