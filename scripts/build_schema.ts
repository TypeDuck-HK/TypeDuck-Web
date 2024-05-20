import { $ } from "bun";
import { cwd } from "process";

const root = cwd();
$.cwd("schema");
await $`rm -rf build default.custom.yaml`;
await $`${root}/build/librime_native/bin/rime_api_console --build`;
