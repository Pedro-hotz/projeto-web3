@echo off

IF "%1"=="install" (
    echo --> Executando: pip install -r requirements.txt
    pip install -r requirements.txt
    exit /b 0
)

IF "%1"=="run" (
    echo --> Executando: python main.py
    python main.py
    exit /b 0
)

IF "%1"=="d-run" (
    echo --> Executando: docker run (Postgres)
    docker run --name ong -e POSTGRES_USER=appuser -e POSTGRES_PASSWORD=minhasenha -e POSTGRES_DB=projeto_faculdade -p 5432:5432 -d postgres
    exit /b 0
)

echo Uso: run.bat {install^|run^|d-run}
exit /b 1