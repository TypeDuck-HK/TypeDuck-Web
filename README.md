# TypeDuck Web

> [TypeDuck](https://typeduck.hk): _Cantonese for everyone at your fingertips_

This repository contains the source code for TypeDuck Web.

Visit [typeduck.hk/web](https://typeduck.hk/web) to give it a try!

## Development

TypeDuck Web is a static single-paged application (SPA) built with [TypeScript](https://www.typescriptlang.org), [React](https://reactjs.org), [Tailwind CSS](https://tailwindcss.com) and [daisyUI](https://daisyui.com).

The [RIME Input Method Engine](https://rime.im) is the technology that powers TypeDuck Web. It is compiled to [WebAssembly](https://webassembly.org) with [Emscripten](https://emscripten.org) and runs right in your browser without any data being sent to the server.

### Prerequisites

- [Bun](https://bun.sh)

  Execute the command provided on the website to install Bun. Alternatively, you may install it with npm:

  ```sh
  npm i -g bun
  ```

- [CMake](https://cmake.org)
- [Ninja](https://ninja-build.org)
- [LLVM](https://llvm.org) (Windows only)

  You may install the above prerequisites with the following commands:

  ```sh
  # Ubuntu
  sudo apt install -y cmake ninja-build
  # macOS
  brew install cmake ninja
  # Windows
  choco install -y cmake --ia "ADD_CMAKE_TO_PATH=System"
  choco install -y ninja llvm
  ```

  On Windows, you may skip the installation above and execute subsequent commands in _Developer PowerShell for Visual Studio_ if you have Visual Studio installed.

- [Emscripten](https://emscripten.org)

  Follow the [installation guide](https://emscripten.org/docs/getting_started/downloads.html) to install Emscripten.

### Compilation

On Ubuntu, the following additional packages should be pre-installed:

```sh
sudo apt install -y \
    libboost-dev \
    libboost-regex-dev \
    libyaml-cpp-dev \
    libleveldb-dev \
    libmarisa-dev \
    libopencc-dev
```

Then, execute the following commands in order:

```sh
bun run boost
bun run native
bun run schema
bun run lib
bun run wasm
```

### Building the Worker Script

```sh
bun run worker
```

### Starting the Development Server

```sh
bun start
```

However, the above command is slow to start, at least on Windows. For a faster development experience, you may want to simply build the project.

### Building the Project

```sh
bun run build
```

### Previewing the Output

```sh
bun run preview
```
