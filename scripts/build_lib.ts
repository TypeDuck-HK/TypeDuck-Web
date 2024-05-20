import { $ } from "bun";
import { argv, cwd } from "process";

import { patch } from "./utils";

const root = cwd();
const ENABLE_LOGGING = import.meta.env["ENABLE_LOGGING"] ?? "ON";
const BUILD_TYPE = import.meta.env["BUILD_TYPE"] ?? "Release";
const CXXFLAGS = "-fexceptions -DBOOST_DISABLE_CURRENT_LOCATION";
const DESTDIR = `${root}/build/sysroot`;
const CMAKE_FIND_ROOT_PATH = `${DESTDIR}/usr`;
const CMAKE_DEF = {
	raw: `\
        -G Ninja \
        -DCMAKE_INSTALL_PREFIX:PATH=/usr \
        -DCMAKE_BUILD_TYPE:STRING=${BUILD_TYPE} \
        -DBUILD_SHARED_LIBS:BOOL=OFF \
    `,
};

$.env({ ...import.meta.env, CXXFLAGS, DESTDIR });

const targetHandlers = {
	async "yaml-cpp"() {
		console.log("Building yaml-cpp");
		const src = "librime/deps/yaml-cpp";
		const dst = "build/yaml-cpp";
		await $`rm -rf ${dst}`;
		await $`emcmake cmake ${src} -B ${dst} \
            ${CMAKE_DEF} \
            -DYAML_CPP_BUILD_CONTRIB:BOOL=OFF \
            -DYAML_CPP_BUILD_TESTS:BOOL=OFF \
            -DYAML_CPP_BUILD_TOOLS:BOOL=OFF \
        `;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "leveldb"() {
		console.log("Building leveldb");
		const src = "librime/deps/leveldb";
		const dst = "build/leveldb";
		await patch("leveldb.patch", src);
		await $`rm -rf ${dst}`;
		await $`emcmake cmake ${src} -B ${dst} \
            ${CMAKE_DEF} \
            -DLEVELDB_BUILD_BENCHMARKS:BOOL=OFF \
            -DLEVELDB_BUILD_TESTS:BOOL=OFF \
        `;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "marisa"() {
		console.log("Building marisa-trie");
		const src = "librime/deps/marisa-trie";
		const dst = "build/marisa-trie";
		await patch("marisa.patch", src);
		await $`rm -rf ${dst}`;
		await $`emcmake cmake ${src} -B ${dst} ${CMAKE_DEF}`;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "opencc"() {
		console.log("Building opencc");
		const src = "librime/deps/opencc";
		const dst = "build/opencc";
		await patch("opencc.patch", src);
		await $`rm -rf ${dst}`;
		await $`emcmake cmake ${src} -B ${dst} \
            ${CMAKE_DEF} \
            -DCMAKE_FIND_ROOT_PATH:PATH=${CMAKE_FIND_ROOT_PATH} \
            -DSHARE_INSTALL_PREFIX:PATH=/usr/share/rime-data/ \
            -DENABLE_DARTS:BOOL=OFF \
            -DUSE_SYSTEM_MARISA:BOOL=ON \
        `;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "glog"() {
		if (ENABLE_LOGGING !== "ON") {
			console.log("Skip glog");
			return;
		}
		console.log("Building glog");
		const src = "librime/deps/glog";
		const dst = "build/glog";
		await patch("glog.patch", src);
		await $`rm -rf ${dst}`;
		await $`emcmake cmake ${src} -B ${dst} \
            ${CMAKE_DEF} \
            -DWITH_GFLAGS:BOOL=OFF \
            -DBUILD_TESTING:BOOL=OFF \
            -DWITH_UNWIND:BOOL=OFF \
        `;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "rime"() {
		console.log("Building librime");
		const src = "librime";
		const dst = "build/librime_wasm";
		await patch("librime.patch", src);
		await $`rm -rf ${dst}`;
		await $`emcmake cmake ${src} -B ${dst} \
            ${CMAKE_DEF} \
            -DCMAKE_FIND_ROOT_PATH:PATH=${CMAKE_FIND_ROOT_PATH} \
            -DBUILD_TEST:BOOL=OFF \
            -DBUILD_STATIC:BOOL=ON \
            -DENABLE_THREADING:BOOL=OFF \
            -DENABLE_TIMESTAMP:BOOL=OFF \
            -DENABLE_LOGGING:BOOL=${ENABLE_LOGGING} \
        `;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},
};

const buildTargets = new Set(argv.slice(2));
const unknownTargets = buildTargets.difference(new Set(Object.keys(targetHandlers)));
if (unknownTargets.size) {
	throw new Error(`Unknown targets: '${Array.from(unknownTargets).join("', '")}'`);
}

for (const [target, handler] of Object.entries(targetHandlers)) {
	if (!buildTargets.size || buildTargets.has(target)) {
		await handler();
	}
}
