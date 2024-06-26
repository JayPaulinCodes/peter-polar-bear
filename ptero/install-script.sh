#!/bin/bash
# Generic Bot Installation Script
#
# Server Files: /mnt/server
# Script Container: node:21-bullseye-slim
readonly ROOT_DIR=/mnt/server

echo -e "----------------------------------------------------------------------"
echo -e "Running apt update"
apt update
echo -e "Installing other packages (dos2unix, curl, jq, file, tar, rsync)"
apt install -y dos2unix curl jq file tar rsync

echo -e "----------------------------------------------------------------------"
echo -e "Updating npm (this may take some time)"
npm install npm@latest -g

if [ "$(ls -A $ROOT_DIR)" ]; then
    echo -e "----------------------------------------------------------------------"
    echo -e "\"$ROOT_DIR\" directory is not empty, clearing it"
    rm -rfv $ROOT_DIR
fi

echo -e "----------------------------------------------------------------------"
echo -e "Creating \"$ROOT_DIR\" directory"
mkdir -p $ROOT_DIR
cd $ROOT_DIR

echo -e "----------------------------------------------------------------------"
echo -e "Expected to pull artifact from git, trying to do so"

readonly GIT_ADDRESS="https://github.com/${GIT_OWNER}/${GIT_NAME}/releases/latest/download/pterodactyl-package.tar.gz"
curl --location "${GIT_ADDRESS}" \
    --output "artifact.tar.gz"

tar -xvzf artifact.tar.gz -C $ROOT_DIR
rsync -vr $ROOT_DIR/artifacts/ .
rm $ROOT_DIR/artifact.tar.gz
rm -rfv $ROOT_DIR/artifacts/
find $ROOT_DIR -type f -name "*.sh" -exec dos2unix {} \;

if [ -f $ROOT_DIR/package-lock.json ]; then
    echo -e "----------------------------------------------------------------------"
    echo -e "Found package-lock.json, trying to clean install packages"
    /usr/local/bin/npm ci
elif [ -f $ROOT_DIR/package.json ]; then
    echo -e "----------------------------------------------------------------------"
    echo -e "Found package.json, trying to install packages"
    /usr/local/bin/npm install
else
    echo -e "----------------------------------------------------------------------"
    echo -e "Didn't find package-lock.json or package.json, not installing any packages"
fi

if [ ! -z "${ENV_CONTENT}" ]; then
    echo -e "----------------------------------------------------------------------"
    echo -e "Trying to build .env file"

    echo "" > ".env"
    IFS=$'\n'; ADDR=($ENV_CONTENT); unset IFS;
    for i in "${ADDR[@]}"; do
        echo -e "$i" >> ".env"
    done
fi

echo -e "----------------------------------------------------------------------"
echo -e "Setting file permissions"
find . -type f -name "*.sh" -exec chmod 755 {} \;

echo -e "----------------------------------------------------------------------"
echo -e "Install complete"
exit 0