import { $ } from "bun";
import { exists } from "fs/promises";
import { platform } from "os";

const PLATFORM = platform();
function bash(command: string) {
	return PLATFORM === "win32" ? $`bash -c ${command}` : $`${{ raw: command }}`;
}

const includeDir = "build/sysroot/usr/include";
const boostVersion = "1.85.0";
const archiveName = `boost-${boostVersion}-cmake.tar.xz`;

if (!await exists(archiveName)) {
	await Bun.write(archiveName, await fetch(`https://github.com/boostorg/boost/releases/download/boost-${boostVersion}/${archiveName}`));
	await $`rm -rf boost`;
}
if (!await exists("boost")) {
	await bash(`tar -xvf ${archiveName}`);
	await $`mv boost-${boostVersion} boost`;
}
await $`rm -rf ${includeDir}/boost`;
await $`mkdir -p ${includeDir}/boost`;
await bash(`cp -rf boost/libs/*/include/boost ${includeDir}`);
await bash(`cp -rf boost/libs/numeric/*/include/boost ${includeDir}`);
