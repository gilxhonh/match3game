import { Container } from "pixi.js";
import { fromEditor } from "@gdk/core-pixi";
import type { Button } from "@gdk/core-pixi";

import * as utils from "./utils";

export class Rules extends Container {
	@fromEditor("content")
	protected content!: Container;
	@fromEditor("content.closeButton")
	protected closeButton!: Button;
	@fromEditor("content.nextButton")
	protected nextButton!: Button;
	@fromEditor("content.prevButton")
	protected prevButton!: Button;
	@fromEditor("content.okButton")
	protected okButton!: Button;


	@fromEditor("content.slide*")
	protected slides: Container[] = [];

	public onLoaded(): void {
		const onExit = this.exit.bind(this);
		this.closeButton.on("pointertap", onExit);
		this.okButton.on("pointertap", onExit);
		this.nextButton.on("pointertap", this.next.bind(this));
		this.prevButton.on("pointertap", this.previous.bind(this));

		this.on("childAdded", this.update.bind(this));

		this.select(this.slides[0]);
	}

	public enter(delay = 0): Promise<void> {
		const result = utils.scaleIn(this.content, delay);
		this.visible = true;
		return result;
	}

	public async exit(): Promise<void> {
		await utils.scaleOut(this.content);
		this.visible = false;
		this.emit("done");
	}

	protected update(): void {
		const slide = this.slides.find((slide) => slide.visible);

		this.slides = this.children
			.filter((child) => child instanceof Container
				&& child.name?.startsWith("slide")) as Container[];

		if (slide !== undefined) {
			this.select(slide);
		}
	}

	public next(): void {
		const index = this.slides.findIndex((slide) => slide.visible) ?? -1;
		if (index < this.slides.length) {
			this.select(this.slides[index + 1]);
		}
	}

	public previous(): void {
		const index = this.slides.findIndex((slide) => slide.visible) ?? 0;
		if (index > 0) {
			this.select(this.slides[index - 1]);
		}
	}

	public select(slide: Container | string) {
		const _slide = slide instanceof Container
			? slide
			: this.slides.find((s) => s.name === slide);

		if (slide === undefined) {
			throw new Error(`RulesSlides: no slide named "${name}".`
							+ ` Possible slide names: ${this.slides.map((s) => s.name)};`);
		}

		const slideIndex = this.slides.indexOf(_slide as Container);

		this.nextButton.visible = slideIndex < (this.slides.length - 1);
		this.prevButton.visible = slideIndex > 0;
		this.okButton.visible = slideIndex === (this.slides.length - 1);

		for (const _slide of this.slides) {
			_slide.visible = _slide === slide;
		}
	}
}
