from flask import Flask
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
import os
import dotenv
   
dotenv.load_dotenv()  # Carrega variáveis de ambiente do arquivo .env

app = Flask(__name__)   

# na main, não botamos todas as rotas. Apenas conexão com o BD e token/autorização

# A URI de Conexão usa as credenciais do seu container Docker
# postgresql://usuario:senha@host:porta/nome_do_banco
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 2.3 Definir um Modelo de Dados
class Tarefa(db.Model):
    __tablename__ = 'tarefas'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    completa = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Tarefa {self.titulo}>'

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    senha = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f'<Usuario {self.email}>'

# 2.4 Criar as Tabelas
# É crucial rodar db.create_all() para que o SQLAlchemy crie as tabelas
# no banco de dados com base nos seus modelos (como a classe Tarefa).
with app.app_context():
    db.create_all()


# --- CONFIGURAÇÕES DO FLASK-MAIL (MUITO IMPORTANTE) ---
# Use uma 'Senha de App' do Google para segurança!
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
# --------------------------------------------------------

mail = Mail(app)


# Coloca o site no ar
from router import *
if __name__ == '__main__': 
    app.run(debug=True, host='0.0.0.0', port=5000) # Melhor opção para produção 