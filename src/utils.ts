import { Flip, toast } from "react-toastify";

import type { TypeOptions } from "react-toastify";

export function notify(type: TypeOptions, zh: string, en: string) {
	toast.dismiss();
	toast(`${zh}時發生錯誤。如輸入法不能正常運作，請重新載入頁面。\nAn error occurred while ${en}. If the input method does not work properly, please reload the page.`, {
		type,
		position: "bottom-center",
		theme: document.documentElement.dataset["theme"],
		transition: Flip,
	});
}

export class ConsumedString {
	private i = 0;
	constructor(private string: string) {}
	get isNotEmpty() {
		return this.i < this.string.length;
	}
	consume(char: string) {
		if (this.isNotEmpty && this.string[this.i] === char) {
			this.i++;
			return true;
		}
		return false;
	}
	consumeUntil(char: string) {
		const start = this.i;
		while (this.isNotEmpty) {
			if (this.string[this.i] === char) return this.string.slice(start, this.i++);
			else this.i++;
		}
		return this.string.slice(start, this.i);
	}
	toString() {
		return this.string.slice(this.i);
	}
}

export function* parseCSV(csv: string) {
	let isQuoted = false;
	let value = "";
	for (let i = 0; i < csv.length; i++) {
		if (isQuoted) {
			if (csv[i] === '"') {
				if (csv[i + 1] === '"') value += csv[++i];
				else isQuoted = false;
			}
			else value += csv[i];
		}
		else if (!value && csv[i] === '"') isQuoted = true;
		else if (csv[i] === ",") {
			yield value || undefined;
			value = "";
		}
		else value += csv[i];
	}
	yield value || undefined;
}

export function isPrintable(key: string) {
	return key.length === 1 && key >= " " && key <= "~";
}

export function nonEmptyArrayOrUndefined<T>(array: readonly T[] | undefined) {
	return array?.length ? array as readonly [T, ...T[]] : undefined;
}

export function letSome<const T extends readonly unknown[], R>(values: T, callback: (...values: T) => R): R | null {
	return values.some(Boolean) ? callback(...values) : null;
}
