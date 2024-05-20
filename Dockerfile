FROM emscripten/emsdk as emsdk
FROM node:bookworm as builder

ARG ENABLE_LOGGING=ON
ENV ENABLE_LOGGING ${ENABLE_LOGGING}

RUN apt update
RUN apt upgrade -y
RUN apt install -y \
	cmake \
	ninja-build \
	libboost-dev \
	libboost-regex-dev \
	libyaml-cpp-dev \
	libleveldb-dev \
	libmarisa-dev \
	libopencc-dev

COPY --from=emsdk /emsdk /emsdk
ENV PATH ${PATH}:/emsdk/upstream/emscripten

COPY / /TypeDuck-Web
WORKDIR /TypeDuck-Web

RUN npm i -g bun
RUN bun i
RUN bun run boost
RUN bun run native
RUN bun run schema
RUN bun run lib
RUN bun run wasm
RUN bun run build
