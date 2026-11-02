import unittest
import requests
from etc.colors import Colors

BASE_URL = "http://localhost:8000"

ADMIN_CRED = {
    "email": "admin@example.com",
    "password": "admin"
}

USER_CRED = {
    "email": "usuario@mail.com",
    "password": "123456"
}

colors = Colors()


class TestFilmesFlow(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print(colors.colorize("\nTESTE COMPLETO FILME FLOW","green"))
        print(colors.colorize("\nLOGIN INICIAL","green"))

        # ---------- LOGIN ADMIN ----------
        print(colors.colorize("Fazendo login como ADMIN...","blue"))

        r_admin = requests.post(
            f"{BASE_URL}/send_loginho",
            data=ADMIN_CRED
        )

        print(colors.colorize("Status ADMIN:","blue"), r_admin.status_code)
        print(colors.colorize("Resposta ADMIN:","blue"),  r_admin.text)


        assert r_admin.status_code == 200, r_admin.text

        cls.token_admin = r_admin.json()["access_token"]
        print("Token ADMIN obtido")

        # ---------- LOGIN USER ----------
        print(colors.colorize("\nFazendo login como USER...","green"))

        r_user = requests.post(
            f"{BASE_URL}/send_loginho",
            data=USER_CRED
        )

        print(colors.colorize("Status USER:","blue"),  r_user.status_code)
        print(colors.colorize("Resposta USER:","blue"),  r_user.text)


        assert r_user.status_code == 200, r_user.text

        cls.token_user = r_user.json()["access_token"]
        print(colors.colorize("Token USER obtido","magenta"))

    # 1. USER CADASTRA FILME
    def test_01_usuario_cadastra_filme_pendente(self):

        print(colors.colorize("\nTESTE 01: USER CADASTRA FILME","green"))

        url = f"{BASE_URL}/cadastrani"

        headers = {
            "Authorization": f"Bearer {self.token_user}",
            "Content-Type": "application/json"
        }

        payload = {
            "titulo": "Filme Teste Automático",
            "ano": 2025,
            "duracao": "01:40",
            "sinopse": "Inserido via teste automatizado",
            "imagem": "teste.jpg",
            "orcamento": "R$ 2.000.000",
            "categoria_id": [1],
            "diretor_id": [1],
            "atores_ids": [1],
            "produtora_id": [1],
            "linguagem_id": [1],
            "pais_origem_id": [1]
        }

        response = requests.post(url, json=payload, headers=headers)

        print(colors.colorize("Status:","blue"),  response.status_code)
        print(colors.colorize("Resposta:","blue"),  response.text)

        self.assertEqual(response.status_code, 201)

        data = response.json()

        # GUARDA ID DO FILME CRIADO (IMPORTANTÍSSIMO)
        self.__class__.filme_id = data.get("id")
        
        print("RETORNO CADASTRO:", data)
        print(colors.colorize("ID GERADO:","blue"),  self.__class__.filme_id)

        print(colors.colorize("Filme criado ID:","blue"),  self.__class__.filme_id)
        

    # 2. ADMIN LISTA PENDENTES
    def test_02_admin_lista_filmes_pendentes(self):

        print(colors.colorize("\nTESTE 02: ADMIN LISTA PENDENTES","green"))

        url = f"{BASE_URL}/filmesPendentes"

        headers = {
            "Authorization": f"Bearer {self.token_admin}"
        }

        response = requests.get(url, headers=headers)

        print(colors.colorize("Status:","blue"), response.status_code)
        print(colors.colorize("Resposta:","blue"), response.text)

        self.assertEqual(response.status_code, 200)

        filmes = response.json()

        self.assertTrue(len(filmes) > 0)

        # valida se o filme criado está lá
        encontrou = any(f["id"] == self.__class__.filme_id for f in filmes)

        self.assertTrue(encontrou, "Filme criado não apareceu nos pendentes")

        print(colors.colorize("Filme encontrado nos pendentes","magenta"))


    # 3. ADMIN APROVA FILME
    def test_03_admin_aprova_filme(self):

        print(colors.colorize("\nTESTE 03: ADMIN APROVA","green"))

        self.assertTrue(hasattr(self.__class__, "filme_id"))

        url = f"{BASE_URL}/aprovafilme?id={self.__class__.filme_id}"

        headers = {
            "Authorization": f"Bearer {self.token_admin}"
        }

        response = requests.put(url, headers=headers)

        print(colors.colorize("Status:","blue"), response.status_code)
        print(colors.colorize("Resposta:","blue"), response.text)

        self.assertEqual(response.status_code, 200)

        print(colors.colorize("Filme aprovado","magenta"))

    # 4. ADMIN DELETA FILME
    def test_04_admin_deleta_filme(self):

        print(colors.colorize("\nTESTE 04: ADMIN DELETA","green"))

        self.assertTrue(hasattr(self.__class__, "filme_id"))

        url = f"{BASE_URL}/filme?id={self.__class__.filme_id}"

        headers = {
            "Authorization": f"Bearer {self.token_admin}"
        }

        response = requests.delete(url, headers=headers)

        print(colors.colorize("Status:","blue"), response.status_code)
        print(colors.colorize("Resposta:","blue"), response.text)

        self.assertEqual(response.status_code, 200)

        print(colors.colorize("Filme deletado ","magenta"))

    # 5. VALIDA SE FOI DELETADO
    def test_05_valida_delecao(self):

        print(colors.colorize("\nTESTE 05: VALIDA DELEÇÃO","green"))

        url = f"{BASE_URL}/filme?id={self.__class__.filme_id}"

        headers = {
            "Authorization": f"Bearer {self.token_admin}"
        }

        response = requests.get(url, headers=headers)

        print(colors.colorize("Status:","blue"), response.status_code)
        print(colors.colorize("Resposta:","blue"), response.text)

        # Pode ser 404 ou vazio dependendo da sua API
        self.assertIn(response.status_code, [200, 404])

        if response.status_code == 200:
            self.assertNotIn(str(self.__class__.filme_id), response.text)

        print(colors.colorize("Deleção confirmada ","magenta"))


if __name__ == "__main__":
    unittest.main()