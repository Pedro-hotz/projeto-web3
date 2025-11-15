@echo off
setlocal

IF /I "%1"=="install" (
    echo [SCRIPT]: Instalando dependencias...
    pip install -r requirements.txt
    goto :EOF
)

IF /I "%1"=="serve" (
    echo [SCRIPT]: Rodando aplicacao principal...
    python main.py
    goto :EOF
)

IF /I "%1"=="docker run" (
    echo [SCRIPT]: Inicializando container Docker...
    docker run --name ong -e POSTGRES_USER=appuser -e POSTGRES_PASSWORD=minhasenha -e POSTGRES_DB=projeto_faculdade -p 5432:5432 -d postgres
    goto :EOF
)

:HELP
echo.
echo === Gerenciador de Scripts do Projeto ===
echo USO: run {install^|serve^|d-run}
echo.

:EOF
endlocal