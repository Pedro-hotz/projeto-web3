install:
    pip install -r requirements.txt

run:
    python main.py

docker-run:
    docker run --name ong \
    -e POSTGRES_USER=appuser \
    -e POSTGRES_PASSWORD=minhasenha \
    -e POSTGRES_DB=projeto_faculdade \
    -p 5432:5432 \
    -d postgres
