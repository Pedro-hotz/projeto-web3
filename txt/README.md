# Baixar dependências 

    pip install -r requirements.txt



# ============================================================

Para instalar as dependências:

    make install


Para rodar a aplicação Flask:

    make run


Para rodar a aplicação Flask dentro de um container Docker:

    make docker-run

# ============================================================

    Cria uma imagem 

    docker run --name ong \
    -e POSTGRES_USER=appuser \
    -e POSTGRES_PASSWORD=minhasenha \
    -e POSTGRES_DB=projeto_faculdade \
    -p 5432:5432 \
    -d postgres

    docker stop ong                 => faz a imagem parar de rodar 

    docker ps                       => vê a lista de imagens 

    docker rm ong                   => remove a imagem 



# Comando para rodar o projeto 
    => python main.py 

# projeto-web3
Projeto para criar e implementar em produção um site para uma Ong.


docker stop ong



# No email do destinatário, precisa-se criar uma autentificação de dois fatores e pegar o código de segunrança 