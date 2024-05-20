import type { Actions, ListenerArgsMap, Message, RimeResult, RimeAPI, RimeNotification, RimeDeployStatus } from "./types";

type TypeToString<T> = T extends number ? "number"
	: T extends string ? "string"
	: T extends readonly unknown[] ? "array"
	: T extends boolean ? "boolean"
	: null;

type ArgsToString<T> = { [P in keyof T]: TypeToString<T[P]> };

interface Module {
	ccall<Method extends keyof RimeAPI>(
		ident: Method,
		returnType: TypeToString<ReturnType<RimeAPI[Method]>>,
		argTypes: ArgsToString<Parameters<RimeAPI[Method]>>,
		args: Parameters<RimeAPI[Method]>,
		opts?: Emscripten.CCallOpts,
	): ReturnType<RimeAPI[Method]>;
	FS: typeof FS;
}

declare const Module: Module;

interface PredefinedModule {
	printErr: (message: string) => void;
	onRuntimeInitialized: () => void;
	locateFile: (path: string, prefix: string) => string;
}

declare const globalThis: {
	onRimeNotification<T extends keyof RimeNotification>(type: T, value: RimeNotification[T]): void;
	Module: PredefinedModule;
};

globalThis.onRimeNotification = (type, value) => {
	switch (type) {
		case "deploy":
			dispatch("deployStatusChanged", value as RimeDeployStatus);
			break;
		case "schema":
			dispatch("schemaChanged", ...value.split("/") as [string, string]);
			break;
		case "option": {
			const disabled = value[0] === "!";
			dispatch("optionChanged", value.slice(+disabled), !disabled);
			break;
		}
	}
};

function dispatch<K extends keyof ListenerArgsMap>(name: K, ...args: ListenerArgsMap[K]) {
	postMessage({ type: "listener", name, args });
}

function syncUserDirectory(direction: "read" | "write") {
	return new Promise<void>((resolve, reject) => {
		Module.FS.syncfs(direction === "read", (err?: Error) => err ? reject(err) : resolve());
	});
}

const actions: Actions = {
	async setOption(option, value) {
		Module.ccall("set_option", null, ["string", "number"], [option, +value]);
	},
	async processKey(input) {
		const result = JSON.parse(Module.ccall("process_key", "string", ["string"], [input])) as RimeResult;
		if ("committed" in result) {
			await syncUserDirectory("write");
		}
		return result;
	},
	async selectCandidate(index) {
		return JSON.parse(Module.ccall("select_candidate", "string", ["number"], [index])) as RimeResult;
	},
	async deleteCandidate(index) {
		return JSON.parse(Module.ccall("delete_candidate", "string", ["number"], [index])) as RimeResult;
	},
	async flipPage(backward) {
		return JSON.parse(Module.ccall("flip_page", "string", ["boolean"], [backward])) as RimeResult;
	},
	async customize({ pageSize, enableCompletion, enableCorrection, enableSentence, enableLearning, isCangjie5 }) {
		return Module.ccall("customize", "boolean", ["number", "number"], [
			pageSize,
			[!isCangjie5, !enableLearning, !enableSentence, enableCorrection, !enableCompletion, /* showCangjieRoots */ true]
				.reduce((flags, curr) => (flags << 1) | +curr, 0),
		]);
	},
	async deploy() {
		const result = Module.ccall("deploy", "boolean", [], []);
		await syncUserDirectory("write");
		return result;
	},
};

let loading = true;
const RIME_USER_DIR = "/rime";
const loadRime = new Promise<void>(resolve => {
	globalThis.Module = {
		printErr(message) {
			if (process.env.NODE_ENV !== "production") {
				const match = /^([IWEF])\S+ \S+ \S+ (.*)$/.exec(message);
				if (match) {
					console[({ I: "info", W: "warn", E: "error", F: "error" } as const)[match[1] as "I" | "W" | "E" | "F"]](`[${match[2]}`);
				}
				else {
					console.error(message);
				}
			}
		},
		async onRuntimeInitialized() {
			Module.FS.mkdir(RIME_USER_DIR);
			Module.FS.mount(IDBFS, {}, RIME_USER_DIR);
			await syncUserDirectory("read");
			const success = Module.ccall("init", "boolean", [], []);
			await syncUserDirectory("write");
			loading = false;
			dispatch("initialized", success);
			resolve();
		},
		locateFile(path) {
			return path;
		},
	};
	importScripts("rime.js");
});

addEventListener("message", async ({ data: { name, args } }: MessageEvent<Message>) => {
	if (loading) await loadRime;
	try {
		// @ts-expect-error Unactionable
		const result = await actions[name](...args);
		postMessage({ type: "success", result });
	}
	catch (error) {
		postMessage({ type: "error", error });
	}
});
