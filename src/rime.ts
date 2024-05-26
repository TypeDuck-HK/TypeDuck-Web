import type { Actions, ListenerArgsMap, Message } from "./types";

type ListenerPayload = {
	[K in keyof ListenerArgsMap]: {
		type: "listener";
		name: K;
		args: ListenerArgsMap[K];
	};
}[keyof ListenerArgsMap];

interface SuccessPayload {
	type: "success";
	result: ReturnType<Actions[keyof Actions]>;
}

interface ErrorPayload {
	type: "error";
	error: unknown;
}

type Payload = ListenerPayload | SuccessPayload | ErrorPayload;

type Listeners = { [K in keyof ListenerArgsMap]: (this: Worker, ...args: ListenerArgsMap[K]) => void };

let running: Message | null = null;
const queue: Message[] = [];

const allListenerTypes: (keyof Listeners)[] = [
	"deployStatusChanged",
	"schemaChanged",
	"optionChanged",
	"initialized",
];

const listeners = {} as { [K in keyof Listeners]: Listeners[K][] };
for (const type of allListenerTypes) {
	listeners[type] = [];
}

const worker = new Worker("./worker.js");
worker.addEventListener("message", ({ data }: MessageEvent<Payload>) => {
	if (process.env.NODE_ENV !== "production" || location.search === "?debug") console.log("receive", data);
	const { type } = data;
	if (type === "listener") {
		const { name, args } = data;
		for (const listener of listeners[name]) {
			// @ts-expect-error Unactionable
			listener.apply(worker, args);
		}
	}
	else if (running) {
		const { resolve, reject } = running;
		const nextMessage = queue.shift();
		if (nextMessage) {
			postMessage(nextMessage);
		}
		else {
			running = null;
		}
		if (type === "success") {
			resolve(data.result);
		}
		else {
			reject(data.error);
		}
	}
});

function postMessage(message: Message) {
	if (process.env.NODE_ENV !== "production" || location.search === "?debug") console.log("post", message);
	const { name, args } = running = message;
	worker.postMessage({ name, args });
}

const allActions: (keyof Actions)[] = [
	"setOption",
	"processKey",
	"selectCandidate",
	"deleteCandidate",
	"flipPage",
	"customize",
	"deploy",
];

const Rime = {} as Actions;
for (const action of allActions) {
	Rime[action] = registerAction(action) as never;
}
export default Rime;

function registerAction<K extends keyof Actions>(name: K): Actions[K] {
	// @ts-expect-error Unactionable
	return (...args: Parameters<Actions[K]>) =>
		new Promise((resolve, reject) => {
			const message: Message = { name, args, resolve, reject };
			if (running) {
				queue.push(message);
			}
			else {
				postMessage(message);
			}
		});
}

export function subscribe<K extends keyof Listeners>(type: K, callback: Listeners[K]) {
	listeners[type].push(callback);
	return () => {
		listeners[type] = listeners[type].filter(listener => listener !== callback) as never;
	};
}
