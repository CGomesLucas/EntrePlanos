
import json
from urllib.parse import parse_qs, urlparse
from infra.database import *
from infra.users_database import *
from infra.actorsDirectors import *
from infra.genresProducers import *
from api.jwt import *
from etc.colors import Colors

colors = Colors()

def get_Listagem(handler):
    filmes = loadFilminhos()
    handler._send_json(filmes)

def get_Atores(handler):
    atores = loadActorsDirector("ator")
    handler._send_json(atores)

def get_Diretores(handler):
    diretores = loadActorsDirector("diretor")
    handler._send_json(diretores)

def get_Categorias(handler):
    categorias = loadGenresProducer("categoria")
    handler._send_json(categorias)

def get_Produtoras(handler):
    produtoras = loadGenresProducer("produtora")
    handler._send_json(produtoras)

def get_Linguagem(handler):
    linguagens = loadGenresProducer("linguagem")
    handler._send_json(linguagens)

def get_Pais(handler):
    paises = loadGenresProducer("pais")
    handler._send_json(paises)

def get_Ator(handler):

    query_params = parse_qs(
        urlparse(handler.path).query
    )

    try:
        id_ator = int(
            query_params.get("id", [""])[0]
        )
    except:
        handler._send_json(
            {"error": "ID inválido"},
            400
        )
        return

    ator = loadActorDirectorById(
        "ator",
        id_ator
    )

    if ator is None:
        handler._send_json(
            {"error": "Ator não encontrado"},
            404
        )
        return

    handler._send_json(ator)


def get_Diretor(handler):

    query_params = parse_qs(
        urlparse(handler.path).query
    )

    try:
        id_diretor = int(
            query_params.get("id", [""])[0]
        )
    except:
        handler._send_json(
            {"error": "ID inválido"},
            400
        )
        return

    diretor = loadActorDirectorById(
        "diretor",
        id_diretor
    )

    if diretor is None:
        handler._send_json(
            {"error": "Diretor não encontrado"},
            404
        )
        return

    handler._send_json(diretor)

def get_FilmesPendentes(handler):
    header_auth = handler.headers.get("Authorization", "")

    if not header_auth.startswith("Bearer "):
        handler._send_json({"error": "Token não informado"}, 401)
        return

    token = header_auth.split(" ")[1]
    payload = verify_jwt(token)
    print(token)
    if not payload or payload.get("role") != "admin":
        handler._send_json({"error": "Acesso permitido apenas para admin"}, 403)
        return

    filmes = loadFilminhosPendentes() 

    handler._send_json(filmes)

def get_Filmes(handler):
    query_params = parse_qs(urlparse(handler.path).query)

    try:
        id = int(query_params.get('id', [''])[0])
    except:
        handler._send_json({"error": "ID inválido"}, 400)
        return

    filme = loadFilmini(id)
    print(filme)

    handler._send_json(filme)

def post_AddCat(handler):
    header_auth = handler.headers.get("Authorization", "")
    content_length = int(handler.headers['Content-length'])
    body = handler.rfile.read(content_length).decode('utf-8')
    form_data = parse_qs(body)

    propriedade = form_data.get('cat', [""])[0]
    nome = str(form_data.get('nome', [""])[0])

    print(colors.colorize("Data form", "green"))
    print("Propriedade: ", propriedade)
    print("Nome: ", nome)
    r = "" 
    tabela = ""

    match propriedade:
        case "Atores Principais":
            tabela = "ator"
            name = nome.split()
            primeiro = name[0]
            sobrenome = name[1] if len(name) > 1 else ""
            genero = form_data.get('genero', [""])[0]
            foto = form_data.get("foto", [""])[0]

            print(primeiro, sobrenome)
            r = insertActorDirector(tabela, primeiro, sobrenome, foto, genero)
        case "Diretores":
            tabela = "diretor"
            name = nome.split()
            primeiro = name[0]
            sobrenome = name[1] if len(name) > 1 else ""
            genero = form_data.get('genero', [""])[0]
            foto = form_data.get("foto", [""])[0]

            r = insertActorDirector(tabela, primeiro, sobrenome,foto, genero)
        case "Linguagem":
            tabela = "linguagem"
            r = insertGenresProducer(tabela, nome)
        case "País de Origem":
            tabela = "pais"
            r = insertGenresProducer(tabela, nome)
        case "Produtora":
            tabela = "produtora"
            r = insertGenresProducer(tabela, nome)
        case "Categorias":
            tabela = "categoria"
            r = insertGenresProducer(tabela, nome)
    
    print(tabela, r)

    if auth_token(header_auth):
        handler._send_json(r)
    else:
        handler._send_json({"error": "Token inválido ou expirado"}, 401)


def post_Cadastrani(handler):
    header_auth = handler.headers.get("Authorization", "")

    if not header_auth.startswith("Bearer "):
        handler._send_json({"error": "Token não informado"}, 401)
        return

    token = header_auth.split(" ")[1]
    payload = verify_jwt(token)

    

    if not payload:
        handler._send_json({"error": "Token inválido ou expirado"}, 401)
        return

    # o Role é que define a 'istatus' ela ñ vem do front
    role = payload.get("role")

    istatus = (
        "aprovado"
        if role == "admin"
        else "pendente"
    )


    content_length = int(handler.headers['Content-Length'])
    body = handler.rfile.read(content_length).decode('utf-8')

    try:
        data = json.loads(body)
    except:
        handler._send_json({"error": "JSON inválido"}, 400)
        return
    

    print(colors.colorize("Data form", "magenta"))
    print("Dados: ", data)

    nome = data.get("titulo")
    ano = int(data.get("ano"))
    sinopse = data.get("sinopse")
    duracao = data.get("duracao")
    poster = data.get("imagem")

    orcamento_raw = data.get("orcamento", "0")
    
    if isinstance(orcamento_raw, str):
        orcamento = int(
            orcamento_raw
            .replace("R$", "")
            .replace(".", "")
            .replace(",", "")
            .strip()
        )
    else:
        orcamento = int(orcamento_raw)


    categorias = data.get("categoria_id", [])
    diretores = data.get("diretor_id", [])
    atores = data.get("atores_ids", [])
    produtoras = data.get("produtora_id", [])
    linguagens = data.get("linguagem_id", [])
    paises = data.get("pais_origem_id", [])

    produtora_principal = produtoras[0] if produtoras else None

    resp = insertFilminhos(
        nome=nome,
        produtora_principal=produtora_principal,
        produtoras=produtoras,
        categorias=categorias,
        atores=atores,
        diretores=diretores,
        linguagens=linguagens,
        paises=paises,
        orcamento=orcamento,
        duracao=duracao,
        sinopse=sinopse,
        ano=ano,
        poster=poster,
        istatus=istatus 
    )

    
    handler._send_json({
        "id": resp.get("id"),
        "status": istatus,
        "message":
            "Filme criado com sucesso"
            if istatus == "aprovado"
            else "Filme enviado para aprovação"
    }, 201)


def put_AprovaFilme(handler):
    try:
        header_auth = handler.headers.get("Authorization", "")

        if not header_auth.startswith("Bearer "):
            handler._send_json({"error": "Token não informado"}, 401)
            return

        token = header_auth.split(" ")[1]
        payload = verify_jwt(token)

        if not payload or payload.get("role") != "admin":
            handler._send_json({"error": "Apenas admin pode aprovar filmes"}, 403)
            return

        params = parse_qs(urlparse(handler.path).query)
        filme_id = params.get("id", [None])[0]
        # nome_adm = params.get("nome", [None])[0]
        #TO DO 
        # mandar nome do adm q ta aceitando

        try:
            filme_id = int(filme_id)
            # filme_id = int(filme_id,nome_adm)
        except:
            handler._send_json({"error": "ID inválido"}, 400)
            return

        sucesso = aprovarFilmini(filme_id)

        if sucesso:
            handler._send_json({"message": "Filme aprovado com sucesso"})
        else:
            handler._send_json({"error": "Filme não encontrado"}, 404)

    except Exception as e:
        print("ERRO PUT:", e)
        handler._send_json({"error": str(e)}, 500)


def patch_Filme(handler):
    header_auth = handler.headers.get("Authorization", "")

    if not header_auth.startswith("Bearer "):
        handler._send_json({"error": "Token não informado"}, 401)
        return

    token = header_auth.split(" ")[1]
    payload = verify_jwt(token)

    if not payload or payload.get("role") != "admin":
        handler._send_json({"error": "Apenas admin pode editar filmes"}, 403)
        return

    params = parse_qs(urlparse(handler.path).query)
    id_filme = params.get("id", [None])[0]

    try:
        id_filme = int(id_filme)
    except:
        handler._send_json({"error": "ID inválido"}, 400)
        return

    filme = getFilmeById(id_filme)

    if not filme:
        handler._send_json({"error": "Filme não encontrado"}, 404)
        return

    if filme["istatus"] != "aprovado":
        handler._send_json({"error": "Filme ainda não aprovado"}, 403)
        return

    content_length = int(handler.headers.get('Content-Length', 0))
    body = handler.rfile.read(content_length).decode('utf-8')

    try:
        data = json.loads(body)
    except:
        handler._send_json({"error": "JSON inválido"}, 400)
        return

    campos_para_atualizar = {}

    if "titulo" in data:
        campos_para_atualizar["titulo"] = data["titulo"]

    if "id_produtora_principal" in data:
        campos_para_atualizar["id_produtora_principal"] = data["id_produtora_principal"]

    if "orcamento" in data:
        campos_para_atualizar["orcamento"] = int(
            data["orcamento"]
            .replace("R$", "")
            .replace(".", "")
            .replace(",", "")
            .strip()
        )

    if "duracao" in data:
        campos_para_atualizar["duracao"] = data["duracao"]

    if "sinopse" in data:
        campos_para_atualizar["sinopse"] = data["sinopse"]

    if "ano" in data:
        campos_para_atualizar["ano"] = int(data["ano"])

    if "imagem" in data:
        campos_para_atualizar["poster"] = data["imagem"]

    if campos_para_atualizar:
        patchCamposFilme(id_filme, campos_para_atualizar)

    if "atores" in data:
        patchRelacionamento(id_filme, "filme_ator", "id_ator", data["atores"])

    if "diretores" in data:
        patchRelacionamento(id_filme, "filme_diretor", "id_diretor", data["diretores"])

    if "categorias" in data:
        patchRelacionamento(id_filme, "filme_categoria", "id_categoria", data["categorias"])

    if "linguagens" in data:
        patchRelacionamento(id_filme, "filme_linguagem", "id_linguagem", data["linguagens"])

    if "paises" in data:
        patchRelacionamento(id_filme, "filme_pais", "id_pais", data["paises"])

    if "produtoras" in data:
        patchRelacionamento(id_filme, "filme_produtora", "id_produtora", data["produtoras"])

    handler._send_json({"message": "Filme editado com sucesso"})

def patch_ActorDirector(handler, tabela):

    header_auth = handler.headers.get("Authorization", "")

    if not header_auth.startswith("Bearer "):
        handler._send_json(
            {"error": "Token não informado"},
            401
        )
        return

    token = header_auth.split(" ")[1]

    payload = verify_jwt(token)

    if not payload:
        handler._send_json(
            {"error": "Token inválido ou expirado"},
            401
        )
        return

    if payload.get("role") != "admin":
        handler._send_json(
            {
                "error":
                f"Apenas administradores podem editar {tabela}"
            },
            403
        )
        return

    query_params = parse_qs(
        urlparse(handler.path).query
    )

    try:
        id_item = int(
            query_params.get("id", [""])[0]
        )
    except:
        handler._send_json(
            {"error": "ID inválido"},
            400
        )
        return

    item = loadActorDirectorById(
        tabela,
        id_item
    )

    if item is None:
        handler._send_json(
            {
                "error":
                f"{tabela.capitalize()} não encontrado"
            },
            404
        )
        return

    content_length = int(
        handler.headers.get(
            "Content-Length",
            0
        )
    )

    body = handler.rfile.read(
        content_length
    ).decode("utf-8")

    try:
        data = json.loads(body)
    except:
        handler._send_json(
            {"error": "JSON inválido"},
            400
        )
        return

    campos = {}

    if "nome" in data:
        campos["nome"] = data["nome"]

    if "sobrenome" in data:
        campos["sobrenome"] = data["sobrenome"]

    if "foto" in data:
        campos["foto"] = data["foto"]

    if "id_genero" in data:
        campos["id_genero"] = data["id_genero"]

    if not campos:
        handler._send_json(
            {"error": "Nenhum campo informado para atualização"},
            400
        )
        return

    patchActorDirector(
        tabela,
        id_item,
        campos
    )

    handler._send_json({
        "message":
        f"{tabela.capitalize()} atualizado com sucesso"
    })