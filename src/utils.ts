import type { DisplayObject, Container } from "pixi.js";
import { TweenMax, TimelineMax } from "gsap";

export function shuffle<DataType>(data: DataType[]): DataType[] {
	data = ([] as DataType[]).concat(data);
	let currentIndex = data.length;
	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		[data[currentIndex], data[randomIndex]] = [data[randomIndex], data[currentIndex]];
	}
	return data;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		TweenMax.delayedCall(0.001 * ms, resolve);
	});
}

function scale(
	target: DisplayObject,
	targetScale: { x: number; y: number },
	duration: number,
	delay: number = 0
): Promise<void> {
	return new Promise((resolve) => {
		TweenMax.to(target.scale, 0.001 * duration, {
			x: targetScale.x,
			y: targetScale.y,
			delay: delay * 0.001,
			onStart: () => {
				target.visible = true;
			},
			onComplete: resolve,
		});
	});
}

export async function scaleOut(target: DisplayObject, delay: number = 0): Promise<void> {
	await scale(target, { x: 0, y: 0 }, 200, delay);
	target.visible = false;
}

export function scaleIn(
	target: DisplayObject,
	delay: number = 0,
	targetScale?: { x: number; y: number }
): Promise<void> {
	target.visible = false;

	if (targetScale === undefined) {
		targetScale =
			target.scale.x === 0 || target.scale.y === 0 ? { x: 1, y: 1 } : target.scale.clone();
	}

	target.scale.set(0, 0);
	const result = scale(target, targetScale, 300, delay);
	target.visible = true;
	return result;
}

function fade(
	target: DisplayObject,
	alpha: number,
	duration: number,
	delay: number = 0
): Promise<void> {
	return new Promise((resolve) => {
		TweenMax.to(target, 0.001 * duration, {
			alpha,
			delay: delay * 0.001,
			onComplete: resolve,
		});
	});
}

export function fadeIn(target: DisplayObject, delay: number = 0): Promise<void> {
	target.alpha = 0;
	target.visible = true;
	return fade(target, 1, 500, delay);
}

export async function fadeOut(target: DisplayObject): Promise<void> {
	await fade(target, 0, 300);
	target.visible = false;
	target.alpha = 1;
}

export async function fallIn(target: Container, delay = 0): Promise<void> {
	const position = target.docking ?? target.position;
	const scale = target.scale;
	const y0 = position.y;
	position.y = -1400;
	target.visible = true;

	await sleep(delay);

	target.parent.addChild(target);

	const timeline = new TimelineMax();
	timeline.to(position, 0.2, { y: y0 }, 0);
	timeline.to(scale, 0.1, { x: "+=0.1", y: "-=0.1", ease: "linear" }, 0.2);
	timeline.to(position, 0.1, { y: "+=5", ease: "linear" }, 0.2);
	timeline.to(scale, 0.1, { x: "-=0.1", y: "+=0.1", ease: "linear" }, 0.3);
	timeline.to(position, 0.05, { y: "-=5", ease: "linear" }, 0.3);

	return new Promise((resolve) => {
		timeline.add(resolve);
	});
}
