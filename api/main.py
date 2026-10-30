from fastapi import FastAPI
from pydantic import BaseModel
import psycopg2

app = FastAPI()


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)

# ==========================================
# CONEXÃO COM O BANCO DE DADOS
# ==========================================

def conectar_banco():
    return psycopg2.connect(
        host="postgres",
        port=5432,
        database="sensores",
        user="postgres",
        password="postgres"
    )


# ==========================================
# MODELOS DOS DADOS RECEBIDOS
# ==========================================

class DadosAtmosfera(BaseModel):
    pressao_atmosferica: float
    temperatura: float
    altitude_aproximada: float


class DadosNivelAgua(BaseModel):
    nivel_agua: float

class DadosTemperatura(BaseModel):
    temperatura: float

# ==========================================
# ROTA INICIAL
# ==========================================

@app.get("/")
def inicio():
    return {
        "mensagem": "API funcionando"
    }


# ==========================================
# TESTE DO BANCO
# ==========================================

@app.get("/teste-banco")
def teste_banco():

    conexao = conectar_banco()
    cursor = conexao.cursor()

    cursor.execute("SELECT 1;")

    resultado = cursor.fetchone()

    cursor.close()
    conexao.close()

    return {
        "mensagem": "Banco conectado!",
        "resultado": resultado[0]
    }


# ==========================================
# POST - SALVAR DADOS ATMOSFÉRICOS
# ==========================================

@app.post("/atmosfera")
def salvar_atmosfera(dados: DadosAtmosfera):

    conexao = conectar_banco()
    cursor = conexao.cursor()

    sql = """
        INSERT INTO atmosfera
        (
            pressao_atmosferica,
            temperatura,
            altitude_aproximada
        )
        VALUES (%s, %s, %s);
    """

    cursor.execute(
        sql,
        (
            dados.pressao_atmosferica,
            dados.temperatura,
            dados.altitude_aproximada
        )
    )

    conexao.commit()

    cursor.close()
    conexao.close()

    return {
        "mensagem": "Dados atmosféricos salvos com sucesso!"
    }


# ==========================================
# POST - SALVAR NÍVEL DA ÁGUA
# ==========================================

@app.post("/nivel-agua")
def salvar_nivel_agua(dados: DadosNivelAgua):

    conexao = conectar_banco()
    cursor = conexao.cursor()

    sql = """
        INSERT INTO nivel_agua
        (
            nivel_agua
        )
        VALUES (%s);
    """

    cursor.execute(
        sql,
        (
            dados.nivel_agua,
        )
    )

    conexao.commit()

    cursor.close()
    conexao.close()

    return {
        "mensagem": "Nível da água salvo com sucesso!"
    }


# ==========================================
# GET - BUSCAR DADOS ATMOSFÉRICOS
# ==========================================

@app.get("/atmosfera")
def buscar_atmosfera():

    conexao = conectar_banco()
    cursor = conexao.cursor()

    sql = """
        SELECT
            id,
            data,
            pressao_atmosferica,
            temperatura,
            altitude_aproximada
        FROM atmosfera
        ORDER BY data DESC;
    """

    cursor.execute(sql)

    registros = cursor.fetchall()

    cursor.close()
    conexao.close()

    dados = []

    for registro in registros:

        dados.append({
            "id": registro[0],
            "data": registro[1],
            "pressao_atmosferica": registro[2],
            "temperatura": registro[3],
            "altitude_aproximada": registro[4]
        })

    return dados


# ==========================================
# GET - BUSCAR NÍVEL DA ÁGUA
# ==========================================

@app.get("/nivel-agua")
def buscar_nivel_agua():

    conexao = conectar_banco()
    cursor = conexao.cursor()

    sql = """
        SELECT
            id,
            data,
            nivel_agua
        FROM nivel_agua
        ORDER BY data DESC;
    """

    cursor.execute(sql)

    registros = cursor.fetchall()

    cursor.close()
    conexao.close()

    dados = []

    for registro in registros:

        dados.append({
            "id": registro[0],
            "data": registro[1],
            "nivel_agua": registro[2]
        })

    return dados

# ==========================================
# POST - SALVAR DADOS DE TEMPERATURA
# ==========================================

@app.post("/temperatura")
def salvar_temperatura(dados: DadosTemperatura):

    conexao = conectar_banco()
    cursor = conexao.cursor()

    sql = """
        INSERT INTO temperatura (temperatura)
        VALUES (%s);
    """

    cursor.execute(sql, (dados.temperatura,))

    conexao.commit()

    cursor.close()
    conexao.close()

    return {
        "mensagem": "Temperatura salva com sucesso!"
    }

@app.get("/temperatura")
def buscar_temperatura():

    conexao = conectar_banco()
    cursor = conexao.cursor()

    sql = """
        SELECT
            id,
            data,
            temperatura
        FROM temperatura
        ORDER BY data DESC;
    """

    cursor.execute(sql)

    registros = cursor.fetchall()

    cursor.close()
    conexao.close()

    dados = []

    for registro in registros:
        dados.append({
            "id": registro[0],
            "data": registro[1],
            "temperatura": registro[2]
        })

    return dados