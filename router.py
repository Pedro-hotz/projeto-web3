from main import app
from flask import render_template

## Aqui nos chamamos todas as rotas

# Para criar uma página, precisa criar um route e uma função 
@app.route("/")
def home():
    return render_template("homepage.html") # Quando a url bater na rota, o Flask vai renderizar/chamar o template homepage.html


# Dessa forma é passado parametros pelo URL 
# Caso digitar http://127.0.0.1:5000/perfil/pedro vc vai entrar em uma pagina html que mostra o nome passado
@app.route("/perfil/<nomeUsuario>/<idade>") 
def perfil(nomeUsuario, idade):
    return render_template("usuarios.html", nomeUsuario=nomeUsuario, idade=idade)