from infra.database import *
from etc.colors import Colors

colors = Colors()

TABELAS = ["ator", "diretor"]

def loadActorsDirector(tabela):
    if tabela not in TABELAS:
        raise ValueError("Tabela inválida!")

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(f"SELECT * FROM {tabela}")
    results = cursor.fetchall()

    cursor.close()
    db.close()
    print(colors.colorize("------------- ATORES -----------", "magenta"))
    print(results)
    return [
        {
            "id": item[0],
            "nome": item[1],
            "sobrenome": item[2],
            "foto": item[3],
            "id_genero": item[4]

        }
        for item in results
    ]


def loadActorDirectorById(tabela, id_item):

    if tabela not in TABELAS:
        raise ValueError("Tabela inválida!")

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        f"""
        SELECT *
        FROM {tabela}
        WHERE id_{tabela} = %s
        """,
        (id_item,)
    )

    item = cursor.fetchone()

    cursor.close()
    db.close()

    if not item:
        return None

    return {
        "id": item[0],
        "nome": item[1],
        "sobrenome": item[2],
        "foto": item[3],
        "id_genero": item[4]
    }

def insertActorDirector(tabela, nome, sobrenome, foto="imagem.jpg", genero=3):
    #TODO 
    #colocar uma imagem default
    if tabela not in TABELAS:
        raise ValueError("Tabela inválida!")

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        f"INSERT INTO {tabela} (nome, sobrenome, foto, id_genero) VALUES (%s, %s, %s, %s)",
        (nome, sobrenome, foto, genero)
    )

    db.commit()
    cursor.close()
    db.close()

    return loadActorsDirector(tabela)

def patchActorDirector(
    tabela,
    id_item,
    campos
):
    

    if tabela not in TABELAS:
        raise ValueError("Tabela inválida!")

    sets = []
    valores = []

    for campo, valor in campos.items():
        sets.append(f"{campo} = %s")
        valores.append(valor)

    valores.append(id_item)

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        f"""
        UPDATE {tabela}
        SET {', '.join(sets)}
        WHERE id_{tabela} = %s
        """,
        tuple(valores)
    )

    db.commit()

    cursor.close()
    db.close()

def deleteActorsDirector(tabela, id_item):
    if tabela not in TABELAS:
        raise ValueError("Tabela inválida!")

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(f"SELECT * FROM {tabela} WHERE id_{tabela} = %s", (id_item,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        return {"error": f"{tabela} não encontrado"}

    if tabela == "ator":
        cursor.execute(
            "SELECT * FROM filme_ator WHERE id_ator = %s",
            (id_item,)
        )
    else:  
        cursor.execute(
            "SELECT * FROM filme_diretor WHERE id_diretor = %s",
            (id_item,)
        )

    if cursor.fetchone():
        cursor.close()
        db.close()
        return {
            "error": f"Não é possível deletar {tabela}. Está vinculado a um ou mais filmes."
        }

    cursor.execute(
        f"DELETE FROM {tabela} WHERE id_{tabela} = %s",
        (id_item,)
    )

    db.commit()
    cursor.close()
    db.close()

    return loadActorsDirector(tabela)

