import { $ } from "bun";
import { cwd } from "process";

const root = cwd();
export async function patch(patchFile: string, path?: string) {
	if (path) $.cwd(path);
	if (!await $`git status --porcelain -uno --ignore-submodules`.text()) {
		await $`git apply ${root}/patches/${patchFile}`;
	}
	if (path) $.cwd();
}
