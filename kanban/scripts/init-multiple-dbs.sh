#!/bin/bash
set -e
set -u

function create_user_and_database() {
    local database=$1
    local db_user="${OPENSIGN_DB_USER:-$database}"
    local db_password="${OPENSIGN_DB_PASSWORD:-$database}"
    echo "Creating user and database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        DO \$\$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$db_user') THEN
            CREATE ROLE $db_user LOGIN PASSWORD '$db_password';
          ELSE
            ALTER ROLE $db_user WITH LOGIN PASSWORD '$db_password';
          END IF;
        END
        \$\$;
        SELECT 'CREATE DATABASE $database'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
        GRANT ALL PRIVILEGES ON DATABASE $database TO $db_user;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
        create_user_and_database "$db"
    done
fi
