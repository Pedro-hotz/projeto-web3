import os
from main import app, db, Tarefa, Usuario, mail
from flask import jsonify, redirect, render_template, request, url_for

from flask_mail import Message

## Aqui nos chamamos todas as rotas

# Para criar uma página, precisa criar um route e uma função 
@app.route("/")
def home():
    return render_template("homepage.html") # Quando a url bater na rota, o Flask vai renderizar/chamar o template homepage.html


@app.route("/backoffice")
def backoffice():
    return render_template("backoffice.html") # Quando a url bater na rota, o Flask vai renderizar/chamar o template backoffice.html

# Dessa forma é passado parametros pelo URL 
# Caso digitar http://127.0.0.1:5000/perfil/pedro vc vai entrar em uma pagina html que mostra o nome passado
# @app.route("/perfil/<nomeUsuario>/<idade>") 
# def perfil(nomeUsuario, idade):
#     return render_template("usuarios.html", nomeUsuario=nomeUsuario, idade=idade)


# Exemplo de Rota (para testar)
@app.route('/teste_conexao')
def teste_conexao():
    try:
        # 1. Tentar INSERIR um novo registro
        # O ID deve ser gerado automaticamente
        tarefa_teste = Tarefa(titulo='Tarefa de Conexão OK', completa=False)
        db.session.add(tarefa_teste)
        db.session.commit()
        
        # 2. Tentar CONSULTAR o registro
        ultima_tarefa = Tarefa.query.order_by(Tarefa.id.desc()).first()
        
        if ultima_tarefa.titulo == 'Tarefa de Conexão OK':
            return f'✅ **SUCESSO!** Conexão estabelecida e teste de leitura/escrita OK. O ID da tarefa inserida é: {ultima_tarefa.id}'
        else:
            return f'⚠️ **ERRO NA LEITURA.** A escrita parece ter funcionado, mas o registro lido é diferente.'

    except Exception as e:
        # Se ocorrer qualquer erro (conexão, credenciais, etc.), ele será capturado aqui
        db.session.rollback() # Garante que a transação é desfeita em caso de erro
        return f'❌ **FALHA NA CONEXÃO OU OPERAÇÃO:** Verifique seu container Docker e suas credenciais. Erro: {e}'
    

@app.route('/login', methods=['POST'])
def login():
   if request.method == 'POST':
       email = request.form['email']
       senha = request.form['senha']

       usuario = Usuario.query.filter_by(email=email, senha=senha).first()

       try:
           if usuario:  
               return redirect(url_for("backoffice"))
           else:
               return jsonify({'status': 'erro', 'mensagem': 'Usuário ou senha inválidos.'})

       except Exception as e:
           return jsonify({'status': 'erro', 'mensagem': f'Falha ao realizar login: {e}'})
       

@app.route('/concluido', methods=['POST'])
def concluido():
   if request.method == 'POST':
       email = request.form['email']
       senha = request.form['senha']

       usuario = Usuario.query.filter_by(email=email, senha=senha).first()

       try:
           if usuario:  
               return redirect(url_for("backoffice"))
           else:
               return jsonify({'status': 'erro', 'mensagem': 'Usuário ou senha inválidos.'})

       except Exception as e:
           return jsonify({'status': 'erro', 'mensagem': f'Falha ao realizar login: {e}'})
       

@app.route('/remover', methods=['POST'])
def remover():
   if request.method == 'POST':
       email = request.form['email']
       senha = request.form['senha']

       usuario = Usuario.query.filter_by(email=email, senha=senha).first()

       try:
           if usuario:  
               return redirect(url_for("backoffice"))
           else:
               return jsonify({'status': 'erro', 'mensagem': 'Usuário ou senha inválidos.'})

       except Exception as e:
           return jsonify({'status': 'erro', 'mensagem': f'Falha ao realizar login: {e}'})
       
@app.route('/adicionar', methods=['POST'])
def adicionar():
   if request.method == 'POST':
       email = request.form['email']
       senha = request.form['senha']

       usuario = Usuario.query.filter_by(email=email, senha=senha).first()

       try:
           if usuario:  
               return redirect(url_for("backoffice"))
           else:
               return jsonify({'status': 'erro', 'mensagem': 'Usuário ou senha inválidos.'})

       except Exception as e:
           return jsonify({'status': 'erro', 'mensagem': f'Falha ao realizar login: {e}'})



@app.route('/enviarEmail', methods=['POST'])
def enviarEmail():
   if request.method == 'POST': 
       nome = request.form['nome']
       email = request.form['email']
       telefone = request.form['tel']
       select = request.form['select']
       mensagem = request.form['txt']

       meu_email_autenticado = os.getenv('MAIL_USERNAME')  # O remetente AUTENTICADO

    
    # Criação da Mensagem
       msg = Message(
       # 1. Subject: Identifica o remetente real e o destino
        subject=f'Mensagem do Usuário: {nome}. Categoria: {select} <{email}>',
        
        # 2. Sender: Deve ser sua conta autenticada
        sender=meu_email_autenticado,
        
        # 3. Recipients: O e-mail que recebe a mensagem (você)
        recipients=[meu_email_autenticado], 
        
        # 4. Reply-To: Faz com que "Responder" vá direto para o usuário
        reply_to=email,

        body=f'Nome: {nome}\nEmail de Contato: {email}\nTelefone: {telefone}\nMensagem:\n{mensagem}'
    )
                     
       try:
           mail.send(msg)
           return redirect(url_for("home"))
       
       except Exception as e:
           return jsonify({'status': 'erro', 'mensagem': f'Falha ao enviar e-mail: {e}'})