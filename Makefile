.PHONY: up down demo api test test-unit test-integration web lint

API_PORT ?= 8000

up:
	API_PORT=$(API_PORT) docker compose up --build

down:
	docker compose down

demo:
	API_PORT=$(API_PORT) docker compose up --build -d
	@echo "Dashboard: http://localhost:4173"
	@echo "API docs:  http://localhost:$(API_PORT)/docs"
	@echo "API demo:  make api"

api:
	curl -sS -X POST http://localhost:$(API_PORT)/api/v1/chat -H 'Content-Type: application/json' -d '{"query":"What should the assistant do when evidence is missing?"}'

test: test-unit test-integration

test-unit:
	PYTHONPATH=backend pytest -q backend/tests/test_retrieval.py

test-integration:
	PYTHONPATH=backend pytest -q backend/tests/test_api.py

web:
	npm run dev

lint:
	npm run build
