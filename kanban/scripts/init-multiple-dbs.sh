#!/bin/bash
set -e
set -u

function create_user() {
  local db_user=$1
  local db_password=$2
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --set=db_user="$db_user" --set=db_password="$db_password" <<-'EOSQL'
    SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_user', :'db_password')
    WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'db_user')
    \gexec
    SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'db_user', :'db_password')
    \gexec
EOSQL
}

function create_database() {
  local database=$1
  local db_user=$2
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --set=database="$database" --set=db_user="$db_user" <<-'EOSQL'
    SELECT format('CREATE DATABASE %I', :'database')
    WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_database WHERE datname = :'database')
    \gexec
    SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', :'database', :'db_user')
    \gexec
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
  first_database=${POSTGRES_MULTIPLE_DATABASES%%,*}
  db_user="${OPENSIGN_DB_USER:-$first_database}"
  db_password="${OPENSIGN_DB_PASSWORD:-$first_database}"
  echo "Creating user '$db_user'"
  create_user "$db_user" "$db_password"
  for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
    echo "Creating database '$db'"
    create_database "$db" "$db_user"
  done
fi