#!/bin/bash
set -e

sudo -i -u postgres

psql CREATE ROLE "$POSTGRES_USER" WITH LOGIN SUPERUSER PASSWORD "'$POSTGRES_PASSWORD'";
psql CREATE EXTENSION pgcrypto;

#psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
#create extension pgcrypto;
#EOSQL
