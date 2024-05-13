#!/bin/bash

readonly ROOT_DIR=/home/container

# Writes error to stderr.
err() {
    local IFS=' ' # needed for $*
    local val="ERROR: $*"

    printf '%s\n' "$val" >&2
}

# Writes message to stdout.
log() {
    local IFS=' ' # needed for $*
    local val="$*"

    printf '%s\n' "$val"
}

build_env() {
    # Create the file
    rm "$ROOT_DIR/.env"
    touch "$ROOT_DIR/.env" || {
        # If touch failed
        err "Failed to create $ROOT_DIR/.env"
        return 1
    }

    echo "DISCORD_TOKEN=$DISCORD_TOKEN" >>$ROOT_DIR/.env
    echo "GUILD_ID=$GUILD_ID" >>$ROOT_DIR/.env
    echo "MYSQL_HOST=$MYSQL_HOST" >>$ROOT_DIR/.env
    echo "MYSQL_PORT=$MYSQL_PORT" >>$ROOT_DIR/.env
    echo "MYSQL_USER=$MYSQL_USER" >>$ROOT_DIR/.env
    echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >>$ROOT_DIR/.env
    echo "MYSQL_DATABASE=$MYSQL_DATABASE" >>$ROOT_DIR/.env
    echo "MYSQL_CONNECTION_LIMIT=$MYSQL_CONNECTION_LIMIT" >>$ROOT_DIR/.env
    echo "MYSQL_MAX_IDLE=$MYSQL_MAX_IDLE" >>$ROOT_DIR/.env
    echo "MYSQL_IDLE_TIMEOUT=$MYSQL_IDLE_TIMEOUT" >>$ROOT_DIR/.env

    log "Finished building .env file $(date +'%Y-%m-%dT%H:%M:%S%z')."
}

# Build the .env file
if ! build_env; then
    err "Failed to build .env file; aborting."
    exit 1
fi

# Install packages
npm install

log "Finished service install $(date +'%Y-%m-%dT%H:%M:%S%z')."

# Start the bot
cd /home/container
if [ $USE_DEV="1" ]; then
    exec npm run start:dev
else
    exec npm run start:build
fi
# exec npm run start-prod > \/dev\/null 2>&1