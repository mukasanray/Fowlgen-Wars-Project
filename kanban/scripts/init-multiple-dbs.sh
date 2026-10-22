#!/bin/bash
set -e
set -u

function create_user() {
    local db_user=$1
    local db_password=$2
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --set=db_user="$db_user" --set=db_password="$db_password" <<-'EOSQL'
        CREATE USER :"db_user" WITH PASSWORD :'db_password';
EOSQL
}

function create_database() {
    local database=$1
    local db_user=$2
    echo "Creating database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --set=database="$database" --set=db_user="$db_user" <<-'EOSQL'
        CREATE DATABASE :"database";
        GRANT ALL PRIVILEGES ON DATABASE :"database" TO :"db_user";
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    first_database=${POSTGRES_MULTIPLE_DATABASES%%,*}
    db_user="${OPENSIGN_DB_USER:-$first_database}"
    db_password="${OPENSIGN_DB_PASSWORD:-$first_database}"
    echo "Creating user '$db_user'"
    create_user "$db_user" "$db_password"
    for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
        create_database "$db" "$db_user"
    done
fi
