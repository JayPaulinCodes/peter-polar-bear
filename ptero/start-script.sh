#!/bin/bash
# Generic Bot Startup Script
#
# Server Files: /home/container
readonly ROOT_DIR=/home/container
cd $ROOT_DIR

if [ "${AUTO_UPDATE}" == "true" ] || [ "${AUTO_UPDATE}" == "1" ]; then
    echo -e "-----"
    echo -e "Clearing old files"
    arr=()
    for dir in $ROOT_DIR/*; do
        [ "$dir" = "$ROOT_DIR/data" ] && continue
        [ "$dir" = "$ROOT_DIR/logs" ] && continue
        [ "$dir" = "$ROOT_DIR/ptero" ] && continue
        echo -e "Adding $dir to old file list"
        arr+=("$dir")
    done
    rm -rfv "${arr[@]}"

    echo -e "-----"
    echo -e "Expected to pull artifact from git, trying to do so"
    sleep 10s

    readonly GIT_ADDRESS="https://github.com/${GIT_OWNER}/${GIT_NAME}/releases/latest/download/pterodactyl-package.tar.gz"
    curl --location "${GIT_ADDRESS}" \
        --output "actifact.zip"

    mkdir $ROOT_DIR/.temp-artifact
    unzip actifact.zip -d $ROOT_DIR/.temp-artifact
    echo -e "---"
    rm -rfv $ROOT_DIR/.temp-artifact/ptero
    echo -e "---"
    cp -av $ROOT_DIR/.temp-artifact/. .
    echo -e "---"
    rm -rfv $ROOT_DIR/.temp-artifact
    echo -e "---"
    rm -fv $ROOT_DIR/actifact.zip
    
    echo -e "-----"
    echo -e "Setting file permissions"
    find . -type f -name "*.sh" -exec chmod 755 {} \;
fi

cd $ROOT_DIR

if [ ! -z "${ENV_CONTENT}" ]; then
    echo -e "---"
    echo -e "Trying to build .env file"

    echo "" > ".env"
    IFS=$'\n'; ADDR=($ENV_CONTENT); unset IFS;
    for i in "${ADDR[@]}"; do
        echo -e "$i" >> ".env"
    done
fi

if [ -f $ROOT_DIR/package-lock.json ]; then
    echo -e "---"
    echo -e "Found package-lock.json, trying to clean install packages"
    /usr/local/bin/npm ci
elif [ -f $ROOT_DIR/package.json ]; then
    echo -e "---"
    echo -e "Found package.json, trying to install packages"
    /usr/local/bin/npm install
else
    echo -e "---"
    echo -e "Didn't find package-lock.json or package.json, startup stopped"
    exit 10
fi

if [ "${RUN_ENV}" == "production" ]; then
    echo -e "---"
    echo -e "Trying to start Bot in production mode"
    /usr/local/bin/npm run ptero:start:prod
elif [ "${RUN_ENV}" == "development" ]; then
    echo -e "---"
    echo -e "Trying to start Bot in development mode"
    /usr/local/bin/npm run ptero:start:dev
else
    echo -e "---"
    echo -e "Run environment didn't match anything, defaulting to development"
    /usr/local/bin/npm run ptero:start:dev
fi
