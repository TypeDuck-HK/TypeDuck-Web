import { useCallback, useEffect, useState } from "react";

import { useSet } from "react-use";
import superjson from "superjson";
import useLocalStorageState from "use-local-storage-state";

import { DEFAULT_PREFERENCES, Language } from "./consts";
import Rime, { subscribe } from "./rime";
import { notify } from "./utils";

import type { PreferencesWithSetter } from "./types";
import type { DispatchWithoutAction } from "react";

export function useLoading(): [boolean, (asyncTask: () => Promise<void>) => void, () => PromiseWithResolvers<void>] {
	const [promises, { add, remove }] = useSet<Promise<void>>();

	const runAsyncTask = useCallback((asyncTask: () => Promise<void>) => {
		async function processAsyncTask() {
			try {
				await asyncTask();
			}
			finally {
				remove(promise);
			}
		}
		const promise = processAsyncTask();
		add(promise);
	}, [add, remove]);

	const startAsyncTask = useCallback(() => {
		let resolve!: () => void;
		let reject!: () => void;
		const promise = new Promise<void>((_resolve, _reject) => {
			resolve = _resolve;
			reject = _reject;
		});
		runAsyncTask(() => promise);
		return { promise, resolve, reject };
	}, [runAsyncTask]);

	return [!!promises.size, runAsyncTask, startAsyncTask];
}

export function useRimeOption(option: string, defaultValue: boolean, deployStatus: number, localStorageKey?: string): [boolean, DispatchWithoutAction] {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [value, setValue] = localStorageKey ? useLocalStorageState(localStorageKey, { defaultValue }) : useState(defaultValue);

	useEffect(() => {
		async function setOption() {
			try {
				await Rime.setOption(option, value);
			}
			catch {
				notify("error", "套用選項", "applying the option");
			}
		}
		void setOption();
	}, [option, value, deployStatus]);

	useEffect(() =>
		subscribe("optionChanged", (rimeOption, rimeValue) => {
			if (rimeOption === option) {
				setValue(rimeValue);
			}
		}), [option, setValue]);

	return [value, useCallback(() => setValue(value => !value), [setValue])];
}

export function usePreferences() {
	return Object.fromEntries(
		Object.entries(DEFAULT_PREFERENCES).flatMap(([key, defaultValue]) => {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			const [optionValue, setOptionValue] = useLocalStorageState(
				key,
				{
					defaultValue,
					serializer:
						key === "displayLanguages"
							? {
								stringify: (languages) => [...languages as Set<Language>].join(),
								parse: (values) => new Set(values.split(",").map(value => value.trim() as Language)),
							}
							: typeof defaultValue === "string"
							? {
								stringify: (v) => String(v),
								parse: (s) => s,
							}
							: JSON,
				}
			);
			return [[key, optionValue], [`set${key[0].toUpperCase()}${key.slice(1)}`, setOptionValue]];
		}),
	) as PreferencesWithSetter;
}
