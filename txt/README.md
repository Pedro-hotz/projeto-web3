# projeto-web3
Projeto para criar e implementar em produção um site para uma Ong.


# Guia ========================================================

    1º -> Você vai no terminal do vscode e abre no terminal "CMD" ou "Command prompt"
    2º -> Vai rodar o comando "run install" para instalar tudo o que precisa para rodar o projeto.
    3º -> È necessário criar uma imagem no docker, então rode "run dock"
    4º -> Para finalmente rodar, digite o comando "run serve" ai vai rodar local.

    run install => Instala as dependências do projeto 

    run serve => Roda o projeto 

    run d-run => Cria a imagem para conectar no banco 

    docker rm ong => caso de erro dizendo que já existe uma imagem com esse nome, apague com esse comando e rode dnv

    docker stop ong                 => faz a imagem parar de rodar 

    docker ps                       => vê a lista de imagens 


# ============================================================

<!-- Cria uma imagem 
    docker run --name ong \
    -e POSTGRES_USER=appuser \
    -e POSTGRES_PASSWORD=minhasenha \
    -e POSTGRES_DB=projeto_faculdade \
    -p 5432:5432 \
    -d postgres -->
