import { $ } from "bun";
import { platform } from "os";
import { argv, cwd, exit } from "process";

import { patch } from "./utils";

const root = cwd();
const PLATFORM = platform();

const dst = "build";
const dstRime = "build/librime_native";

const CMAKE_INSTALL_PREFIX = `"${root}/librime"`;
const CMAKE_DEF_COMMON = `\
    -G Ninja \
    -DCMAKE_BUILD_TYPE:STRING=Release ${
	PLATFORM === "win32"
		? `\
            -DCMAKE_C_COMPILER=clang \
            -DCMAKE_CXX_COMPILER=clang++ \
            -DCMAKE_USER_MAKE_RULES_OVERRIDE:PATH="${root}/librime/cmake/c_flag_overrides.cmake" \
            -DCMAKE_USER_MAKE_RULES_OVERRIDE_CXX:PATH="${root}/librime/cmake/cxx_flag_overrides.cmake" \
            -DCMAKE_EXE_LINKER_FLAGS_INIT:STRING=-llibcmt \
            -DCMAKE_MSVC_RUNTIME_LIBRARY:STRING=MultiThreaded`
		: ""
}`;
const CMAKE_DEF = {
	raw: `\
        -B ${dst} \
        ${CMAKE_DEF_COMMON} \
        -DCMAKE_INSTALL_PREFIX:PATH=${CMAKE_INSTALL_PREFIX} \
        -DBUILD_SHARED_LIBS:BOOL=OFF \
    `,
};
const CMAKE_DEF_RIME = {
	raw: `\
        -B ${dstRime} \
        ${CMAKE_DEF_COMMON} \
        -DBUILD_SHARED_LIBS:BOOL=ON \
        ${PLATFORM === "linux" ? "" : "-DBUILD_STATIC:BOOL=ON"} \
        -DBUILD_TEST:BOOL=OFF \
        -DBoost_INCLUDE_DIR:PATH="${root}/build/sysroot/usr/include" \
        -DENABLE_TIMESTAMP:BOOL=OFF \
        -DENABLE_LOGGING:BOOL=OFF \
    `,
};

if (PLATFORM !== "linux") {
	$.env({ ...import.meta.env, BOOST_ROOT: `${root}/boost` });
}

let hasError = false;

const targetHandlers = {
	async "yaml-cpp"() {
		console.log("Building yaml-cpp");
		$.cwd("librime/deps/yaml-cpp");
		await $`rm -rf ${dst}`;
		await $`cmake . \
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
		$.cwd("librime/deps/leveldb");
		await $`rm -rf ${dst}`;
		await $`cmake . \
            ${CMAKE_DEF} \
            -DCMAKE_CXX_FLAGS:STRING=-Wno-error=deprecated-declarations \
            -DLEVELDB_BUILD_BENCHMARKS:BOOL=OFF \
            -DLEVELDB_BUILD_TESTS:BOOL=OFF \
        `;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "marisa"() {
		console.log("Building marisa-trie");
		$.cwd("librime/deps/marisa-trie");
		await patch("marisa.patch");
		await $`rm -rf ${dst}`;
		await $`cmake . ${CMAKE_DEF}`;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "opencc"() {
		console.log("Building opencc");
		$.cwd("librime/deps/opencc");
		await patch("opencc.patch");
		await $`rm -rf ${dst}`;
		await $`cmake . \
            ${CMAKE_DEF} \
            -DCMAKE_FIND_ROOT_PATH:PATH=${CMAKE_INSTALL_PREFIX} \
            -DENABLE_DARTS:BOOL=OFF \
            -DUSE_SYSTEM_MARISA:BOOL=ON \
        `;
		await $`cmake --build ${dst}`;
		await $`cmake --install ${dst}`;
	},

	async "glog"() {
		console.error(`'glog' need not be built in phase 'native'`);
		hasError = true;
	},

	async "rime"() {
		console.log("Building librime");
		$.cwd();
		await patch("librime.patch", "librime");
		await $`rm -rf ${dstRime}`;
		await $`cmake librime ${CMAKE_DEF_RIME}`;
		await $`cmake --build ${dstRime}`;
	},
};

function needNotBeBuilt(target: string) {
	return async () => {
		console.error(`'${target}' need not be built in Linux in phase 'native'`);
		hasError = true;
	};
}

const nonPosixTargets: (keyof typeof targetHandlers)[] = ["yaml-cpp", "leveldb", "marisa", "opencc"];
if (PLATFORM === "linux") {
	for (const target of nonPosixTargets) {
		targetHandlers[target] = needNotBeBuilt(target);
	}
}

const buildTargets = new Set(argv.slice(2));
const unknownTargets = buildTargets.difference(new Set(Object.keys(targetHandlers)));
if (unknownTargets.size) {
	throw new Error(`Unknown targets: '${Array.from(unknownTargets).join("', '")}'`);
}

for (const [target, handler] of Object.entries(targetHandlers)) {
	if (buildTargets.has(target)) {
		await handler();
	}
}
if (hasError) {
	exit(1);
}

if (!buildTargets.size) {
	const allTargets: (keyof typeof targetHandlers)[] = [...(PLATFORM === "linux" ? [] : nonPosixTargets), "rime"];
	for (const handler of allTargets.map(target => targetHandlers[target])) {
		await handler();
	}
}
