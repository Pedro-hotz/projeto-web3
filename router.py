import os
from main import Task, app, db, Tarefa, Usuario, mail
from flask import jsonify, redirect, render_template, request, session, url_for, flash
from flask_mail import Message
from auth import login_required

## Aqui nos chamamos todas as rotas

# Para criar uma página, precisa criar um route e uma função 
@app.route("/")
def home():
    return render_template("homepage.html") # Quando a url bater na rota, o Flask vai renderizar/chamar o template homepage.html


@app.route("/backoffice")
@login_required
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
    

# LOGIN =============================================
@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    senha = request.form.get('senha')

    if not email or not senha:
        return jsonify({
            "status": "erro",
            "mensagem": "Por favor, preencha todos os campos."
        }), 400

    usuario = Usuario.query.filter_by(email=email, senha=senha).first()

    if usuario:
        session['user_id'] = usuario.id
        return jsonify({
            "status": "sucesso",
            "mensagem": "Login realizado com sucesso!",
            "redirect": url_for("backoffice")
        })
    else:
        return jsonify({
            "status": "erro",
            "mensagem": "Credenciais inválidas. Tente novamente."
        }), 401
# ==================================================
       

# USERS =============================================
@app.route('/addUser', methods=['POST'])
def addUser():
    nome = request.form.get('nome')
    email = request.form.get('email')
    senha = request.form.get('senha')
    tipo = request.form.get('tipo')

    if not nome or not email or not senha or not tipo:
        return jsonify({
            "status": "erro",
            "mensagem": "Preencha todos os campos!"
        }), 400

    try:
        novo_usuario = Usuario(nome=nome, email=email, senha=senha, tipo=tipo)
        db.session.add(novo_usuario)
        db.session.commit()

        return jsonify({
            "status": "sucesso",
            "mensagem": "Usuário criado com sucesso!",
            "redirect": url_for("backoffice")
        }), 200

    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro ao criar usuário: {str(e)}"
        }), 500
       
@app.route('/searchUsers/<nome>', methods=['GET'])
def searchUsers(nome):
   if request.method == 'GET':

       try:
           usuarios = Usuario.query.filter(
               Usuario.nome.contains(nome)
           ).all()


           return jsonify([{
               'nome': usuario.nome,
               'email': usuario.email,
               'senha': usuario.senha,
               'tipo': usuario.tipo
           } for usuario in usuarios])

       except Exception as e:
           return jsonify({'status': 'erro', 'mensagem': f'Falha ao buscar usuários: {e}'})


@app.route('/deleteUser/<id>', methods=['DELETE'])
def deleteUser(id):
    usuario = Usuario.query.get(id)

    if usuario:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({'status': 'sucesso', 'mensagem': 'Usuário removido com sucesso.'})
    else:
        return jsonify({'status': 'erro', 'mensagem': 'Usuário não encontrado.'})


@app.route('/users', methods=['GET'])  # Retorna a lista de TODOS usuários em formato JSON
def getUsers():
    usuarios = Usuario.query.all()
    lista = []

    for usuario in usuarios:
        lista.append({
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email,
            'senha': usuario.senha,
            'tipo': usuario.tipo
        })

    return jsonify(lista)
# ==================================================


# TASKS =============================================
@app.route('/tasks', methods=['GET'])
def getTasks():
    tasks = Task.query.all()
    lista = []

    for task in tasks:
        lista.append({
            'titulo': task.titulo,
            'descricao': task.descricao,
            'completa': task.completa
        })

    return jsonify(lista)


@app.route('/addTasks', methods=['POST'])
def addTasks():
    titulo = request.form['titulo']
    descricao = request.form['descricao']

    try:
        nova_tarefa = Task(titulo=titulo, descricao=descricao, completa=False)
        db.session.add(nova_tarefa)
        db.session.commit()

        return render_template("backoffice.html")

    except Exception as e:
        db.session.rollback()
        flash(f"Erro ao adicionar tarefa: {e}", "error")
        return redirect(url_for("backoffice"))

# ==============================================


#  ENVIAR EMAIL =============================================
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
# ==================================================