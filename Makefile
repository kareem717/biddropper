#!make
include .env.local

build:
	@bun build

run: build
	@bun run

dev:
	@bun run dev

db-status:
	@GOOSE_DRIVER=${GOOSE_DRIVER} GOOSE_DBSTRING=${DATABASE_URL} goose -dir=${GOOSE_MIGRATIONS_PATH} status

db-up:
	@GOOSE_DRIVER=${GOOSE_DRIVER} GOOSE_DBSTRING=${DATABASE_URL} goose -dir=${GOOSE_MIGRATIONS_PATH} up

db-up-one:
	@GOOSE_DRIVER=${GOOSE_DRIVER} GOOSE_DBSTRING=${DATABASE_URL} goose -dir=${GOOSE_MIGRATIONS_PATH} up-by-one 
	
db-down:
	@GOOSE_DRIVER=${GOOSE_DRIVER} GOOSE_DBSTRING=${DATABASE_URL} goose -dir=${GOOSE_MIGRATIONS_PATH} down

db-reset:
	@GOOSE_DRIVER=${GOOSE_DRIVER} GOOSE_DBSTRING=${DATABASE_URL} goose -dir=${GOOSE_MIGRATIONS_PATH} reset