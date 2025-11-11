install:
	pip install -r requirements.txt  # <- MUST be a TAB

run:
	python main.py                  # <- MUST be a TAB

d-run:
	docker run --name ong -e POSTGRES_USER=appuser -e POSTGRES_PASSWORD=minhasenha -e POSTGRES_DB=projeto_faculdade -p 5432:5432 -d postgres # <- MUST be a TAB