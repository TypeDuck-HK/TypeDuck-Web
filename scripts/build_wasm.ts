import { $ } from "bun";

const libPath = "build/sysroot/usr/lib";
const exportedFunctions = [
	"_init",
	"_set_option",
	"_process_key",
	"_select_candidate",
	"_delete_candidate",
	"_flip_page",
	"_customize",
	"_deploy",
].join();

const compileArgs = {
	raw: `\
        -std=c++17 \
        ${import.meta.env["BUILD_TYPE"] === "Debug" ? "-g" : "-O2 -DBOOST_DISABLE_ASSERTS -DBOOST_DISABLE_CURRENT_LOCATION"} \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s MAXIMUM_MEMORY=4GB \
        -s EXPORTED_FUNCTIONS=${exportedFunctions} \
        -s EXPORTED_RUNTIME_METHODS=["ccall","FS"] \
        --preload-file schema@/usr/share/rime-data \
        -I build/sysroot/usr/include \
        -o public/rime.js \
    `,
};

const linkArgs = {
	raw: `\
        -fexceptions \
        -l idbfs.js \
        -L ${libPath} \
        -Wl,--whole-archive -l rime -Wl,--no-whole-archive \
        -l yaml-cpp \
        -l leveldb \
        -l marisa \
        -l opencc \
        ${(await Bun.file(`${libPath}/librime.a`).text()).includes("LogMessage") ? "-l glog" : ""} \
    `,
};

await $`mkdir -p public`;
await $`em++ -v ${compileArgs} wasm/api.cpp ${linkArgs}`; // --emit-tsd ${root}/src/rime.d.ts
