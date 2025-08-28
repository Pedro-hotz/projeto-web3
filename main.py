from flask import Flask

app = Flask(__name__)   

# na main, não botamos todas as rotas. Apenas conexão com o BD e token/autorização

from router import *

# Coloca o site no ar
if __name__ == '__main__': 
    app.run(debug=True)