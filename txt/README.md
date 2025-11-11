# projeto-web3
Projeto para criar e implementar em produção um site para uma Ong.

# Baixar dependências 

    run install => Instala as dependências do projeto 

    run run => Roda o projeto 

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
