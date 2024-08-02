#!make
include .env.local

build:
	@bun run build
	@bun run start

dev:
	@bun run dev

ngrok:
	@ngrok http --domain=${NGROK_DOMAIN} 3000