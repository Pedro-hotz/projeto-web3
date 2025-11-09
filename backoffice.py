from main import app, Tarefa, db
from flask import render_template, request

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    senha = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f'<Usuario {self.nome}>'
    

def cadas():
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