1. Estrutura do projeto
2. 
meu_site/
│
├── app.py                # Arquivo principal do Flask
├── requirements.txt      # Dependências do projeto
│
├── static/               # Arquivos estáticos (CSS, JS, imagens)
│   ├── css/
│   ├── js/
│   └── img/
│
├── templates/            # Páginas HTML (Jinja2 templates)
│   ├── base.html
│   ├── index.html
│   └── login.html
│
└── database/
    └── models.py         # Modelos do banco de dados

--------------------------------------------------

2. Configurar o ambiente

Crie uma pasta e entre nela:

mkdir meu_site && cd meu_site


Crie e ative um ambiente virtual:

python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows


Instale as dependências:

pip install flask flask_sqlalchemy flask_wtf


Gere o arquivo requirements.txt:

pip freeze > requirements.txt


--------------------------------------------------

3. Criar o back-end com Flask

Arquivo app.py:

from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SECRET_KEY'] = 'chave-secreta'
db = SQLAlchemy(app)

# Modelo de exemplo
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

@app.route('/')
def home():
    usuarios = Usuario.query.all()
    return render_template('index.html', usuarios=usuarios)

@app.route('/add', methods=['POST'])
def add_usuario():
    nome = request.form['nome']
    email = request.form['email']
    novo = Usuario(nome=nome, email=email)
    db.session.add(novo)
    db.session.commit()
    return redirect(url_for('home'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

--------------------------------------------------


5. Melhorias e extensões possíveis

Depois de tudo funcionando, você pode adicionar:

🔐 Login e autenticação (com Flask-Login)

📦 Migrações de banco (Flask-Migrate)

🧭 Blueprints para organizar o código

☁️ Deploy gratuito (Render, Railway, ou Vercel)


--------------------------------------------------











