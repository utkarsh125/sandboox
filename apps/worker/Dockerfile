
##### LEVEL-1 #####
## BASE + SYSTEM ##
# need to use "bookworm-slim" - a lighweight linux with node.js 20 pre-installed
FROM node:20-bookworm-slim AS base

# prevent interactive prompts during apt-get installations
ENV DEBIAN_FRONTEND=noninteractive



#Update the system packages and install all the non-Node deps the worker needs:
# Java Runtime Environment (required by apktool and jadx)
# wget/unzip to download and extract jadx and apktool
# python3/python3-pip for semgrep installation

RUN apt-get update && apt-get install -y \
    default-jre \
    wget \
    unzip \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*
# the above cleanup to make the docker image even smaller

##### LEVEL-2 #####
## EXTERNAL SEC TOOLS ##

## install apktool
RUN wget https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool -O /usr/local/bin/apktool && \
    wget https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.9.3.jar -O /usr/local/bin/apktool.jar && \
    chmod +x /usr/local/bin/apktool /usr/local/bin/apktool.jar

# install jadx
RUN wget https://github.com/skylot/jadx/releases/download/v1.4.7/jadx-1.4.7.zip -O jadx.zip && \
    unzip jadx.zip -d /opt/jadx && \ 
    rm jadx.zip && \
    ln -s /opt/jadx/bin/jadx /usr/local/bin/jadx

# install semgrep but use a env for it
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install semgrep && \
    ln -s /opt/venv/bin/semgrep /usr/local/bin/semgrep

##### LEVEL-3 #####
## WORKSPACE SETUP + NODE DEPS ##

#set the working dir
WORKDIR /app

# enable corepack to use pnpm without "npm install -g pnpm" 
RUN corepack enable

# Copy the monorepo root package files and lockfile first.
# doing this before copying the code caches the "pnpm install" step across builds
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the specific folders needed to make the worker run
# need packages/ for the database client, and apps/worker/ for the actual code.
copy packages ./packages
COPY apps/worker ./apps/worker

#install all deps exactly as they are in the lockfile
RUN pnpm install --frozen-lockfile

##### BUILD + RUN #####
RUN pnpm run build --filter @sandboox/db 

CMD ["pnpm", "--filter", "@sandboox/worker", "dev"]