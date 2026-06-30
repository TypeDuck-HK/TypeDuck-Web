import { $ } from "bun";
import { cwd } from "process";

const root = cwd();
$.cwd("schema");
await $`rm -rf build .github .gitignore *.md LICENSE jyut6ping3_mobile*.yaml *_longpress*.yaml *.custom.yaml`;
await $`${root}/build/librime_native/bin/rime_api_console --build`;
await $`rm -rf user.yaml installation.yaml`;
