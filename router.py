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


# rota de teste de conexão de banco
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
    

    usuario = Usuario.query.filter_by(email=email).first()


    if not usuario:
        return jsonify({
            "status": "erro",
            "mensagem": "E-mail não encontrado!"
        }), 404

    if usuario.senha != senha:
        return jsonify({
            "status": "erro",
            "mensagem": "Senha incorreta!"
        }), 401


    session['user_id'] = usuario.id
    return jsonify({
        "status": "sucesso",
        "mensagem": "Login realizado com sucesso!",
        "redirect": url_for("backoffice")
    })
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
    tasks = Task.query.filter(
            Task.completa.is_(False)
        ).all()
    lista = []

    for task in tasks:
        lista.append({
            'id': task.id,
            'titulo': task.titulo,
            'descricao': task.descricao,
            'completa': task.completa
        })

    return jsonify(lista)




@app.route('/tasks/c', methods=['GET'])
def getTasksCompleta():

    try:
        tasks_completas = Task.query.filter(
            Task.completa.is_(True)
        ).all()

        return jsonify([{
            'id': task.id,
            'titulo': task.titulo,
            'descricao': task.descricao,
            'completa': task.completa
        } for task in tasks_completas])

    except Exception as e:
        return jsonify({
            'status': 'erro', 
            'mensagem': f'Falha ao buscar tarefas concluídas: {e}'
        }), 500
    
    


@app.route('/tasks/converte/<id>', methods=['PUT'])
def putConverte(id):
    try:
        task = Task.query.get(id)

        if not task:
            return jsonify({
                "status": "erro",
                "mensagem": "Tarefa não encontrada."
            }), 404

        # alterna o valor
        task.completa = not task.completa  

        db.session.commit()

        return jsonify({
            'status': 'sucesso',
            'id': task.id,
            'titulo': task.titulo,
            'descricao': task.descricao,
            'completa': task.completa
        })

    except Exception as e:
        return jsonify({
            'status': 'erro',
            'mensagem': f'Falha ao atualizar tarefa: {e}'
        }), 500





@app.route('/deleteTask/<id>', methods=['DELETE'])
def delete_task(id):
    try:
        task = Task.query.get(id)

        if not task:
            return jsonify({'status': 'erro', 'mensagem': 'Tarefa não encontrada.'}), 404

        db.session.delete(task)
        db.session.commit()

        return jsonify({'status': 'sucesso', 'mensagem': 'Tarefa removida com sucesso.'})

    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': f'Erro ao remover tarefa: {e}'}), 500






@app.route('/usuario/atualizar', methods=['PUT'])
def atualizar_usuario():
    data = request.get_json()

    user_id = data.get("id")
    novo_email = data.get("email")
    nova_senha = data.get("senha")

    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"mensagem": "Usuário não encontrado."}), 404

    if novo_email:
        user.email = novo_email

    if nova_senha:
        user.senha = nova_senha

    try:
        db.session.commit()
        return jsonify({"mensagem": "Usuário atualizado com sucesso!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "mensagem": f"Erro ao atualizar usuário: {e}"
        }), 500





@app.route('/addTasks', methods=['POST'])
def addTasks():
    titulo = request.form['titulo']
    descricao = request.form['descricao']

    try:
        nova_tarefa = Task(titulo=titulo, descricao=descricao, completa=False)
        db.session.add(nova_tarefa)
        db.session.commit()

        return jsonify({
            "status": "sucesso",
            "mensagem": "Tarefa criada com sucesso!",
        }), 200

    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro ao criar usuário: {str(e)}"
        }), 500

# ==============================================


#  ENVIAR EMAIL =============================================
@app.route('/enviarEmail', methods=['POST'])
def enviarEmail():
    try:
        nome = request.form.get('nome')
        email = request.form.get('email')
        telefone = request.form.get('tel')
        select = request.form.get('select')
        mensagem = request.form.get('txt')

        meu_email_autenticado = os.getenv('MAIL_USERNAME')

        # Cria a mensagem e quem vai receber  
        msg = Message(
            subject=f'Mensagem do Usuário: {nome}. Categoria: {select} <{email}>',
            sender=meu_email_autenticado,
            recipients=[meu_email_autenticado],
            reply_to=email,
            body=f'Nome: {nome}\nEmail: {email}\nTelefone: {telefone}\n\nMensagem:\n{mensagem}'
        )

        mail.send(msg)

        return jsonify({
            "status": "success",
            "mensagem": "E-mail enviado com sucesso!"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "mensagem": f"Falha ao enviar e-mail: {str(e)}"
        }), 500
# ==================================================