import { LoadedView } from "@gdk/core-pixi";

export class RulesView extends LoadedView {
	public async onDidAppear(): Promise<void> {
		this.visible = true;
	}

	public async onWillDisappear(): Promise<void> {
		this.visible = false;
	}
}
