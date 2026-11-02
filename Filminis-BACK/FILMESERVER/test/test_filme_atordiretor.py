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


class TestActorDirectorCRUD(unittest.TestCase):

    @classmethod
    def setUpClass(cls):

        print(colors.colorize("\nLOGIN ADMIN", "green"))

        response = requests.post(
            f"{BASE_URL}/send_loginho",
            data=ADMIN_CRED
        )

        print(colors.colorize("Status ADMIN:", "blue"), response.status_code)
        print(colors.colorize("Resposta ADMIN:", "blue"), response.text)

        assert response.status_code == 200

        cls.token_admin = response.json()["access_token"]

        print(colors.colorize(
            "Token ADMIN obtido",
            "magenta"
        ))

        print(colors.colorize("\nLOGIN USER", "green"))

        response = requests.post(
            f"{BASE_URL}/send_loginho",
            data=USER_CRED
        )

        print(colors.colorize("Status USER:", "blue"), response.status_code)
        print(colors.colorize("Resposta USER:", "blue"), response.text)

        assert response.status_code == 200

        cls.token_user = response.json()["access_token"]

        print(colors.colorize(
            "Token USER obtido",
            "magenta"
        ))

    # ==========================================================
    # ATORES
    # ==========================================================

    def test_01_cadastra_ator(self):

        print(colors.colorize(
            "\nTESTE 01: CADASTRA ATOR",
            "green"
        ))

        response = requests.post(
            f"{BASE_URL}/addCat",
            headers={
                "Authorization": f"Bearer {self.token_admin}"
            },
            data={
                "cat": "Atores Principais",
                "nome": "Tom Hardy",
                "genero": 1,
                "foto": "https://teste.com/tom.jpg"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

        atores = response.json()

        ator_criado = atores[-1]

        self.__class__.ator_id = ator_criado["id"]

        print(colors.colorize(
            f"ID ATOR: {self.__class__.ator_id}",
            "magenta"
        ))

    def test_02_busca_ator_por_id(self):

        print(colors.colorize(
            "\nTESTE 02: BUSCA ATOR POR ID",
            "green"
        ))

        response = requests.get(
            f"{BASE_URL}/ator?id={self.__class__.ator_id}"
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

        ator = response.json()

        self.assertEqual(
            ator["id"],
            self.__class__.ator_id
        )

        print(colors.colorize(
            "Ator encontrado com sucesso",
            "magenta"
        ))

    def test_03_patch_ator(self):

        print(colors.colorize(
            "\nTESTE 03: PATCH ATOR",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/ator?id={self.__class__.ator_id}",
            headers={
                "Authorization": f"Bearer {self.token_admin}",
                "Content-Type": "application/json"
            },
            json={
                "nome": "Tom",
                "sobrenome": "Hardy Editado",
                "foto": "https://teste.com/tom-editado.jpg"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

    def test_04_valida_patch_ator(self):

        print(colors.colorize(
            "\nTESTE 04: VALIDA PATCH ATOR",
            "green"
        ))

        response = requests.get(
            f"{BASE_URL}/ator?id={self.__class__.ator_id}"
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

        ator = response.json()

        self.assertEqual(
            ator["sobrenome"],
            "Hardy Editado"
        )

        self.assertEqual(
            ator["foto"],
            "https://teste.com/tom-editado.jpg"
        )

        print(colors.colorize(
            "PATCH validado",
            "magenta"
        ))

    def test_05_patch_ator_sem_token(self):

        print(colors.colorize(
            "\nTESTE 05: PATCH ATOR SEM TOKEN",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/ator?id={self.__class__.ator_id}",
            headers={
                "Content-Type": "application/json"
            },
            json={
                "nome": "Hack"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 401)

    def test_06_patch_ator_token_invalido(self):

        print(colors.colorize(
            "\nTESTE 06: PATCH ATOR TOKEN INVÁLIDO",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/ator?id={self.__class__.ator_id}",
            headers={
                "Authorization": "Bearer TOKEN_INVALIDO",
                "Content-Type": "application/json"
            },
            json={
                "nome": "Hack"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 401)

    def test_07_patch_ator_usuario_comum(self):

        print(colors.colorize(
            "\nTESTE 07: PATCH ATOR USER",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/ator?id={self.__class__.ator_id}",
            headers={
                "Authorization": f"Bearer {self.token_user}",
                "Content-Type": "application/json"
            },
            json={
                "nome": "Hack"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 403)

    def test_08_deleta_ator(self):

        print(colors.colorize(
            "\nTESTE 08: DELETA ATOR",
            "green"
        ))

        response = requests.delete(
            f"{BASE_URL}/atores?id={self.__class__.ator_id}",
            headers={
                "Authorization": f"Bearer {self.token_admin}"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

    def test_09_valida_delecao_ator(self):

        print(colors.colorize(
            "\nTESTE 09: VALIDA DELEÇÃO ATOR",
            "green"
        ))

        response = requests.get(
            f"{BASE_URL}/ator?id={self.__class__.ator_id}"
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 404)

    # ==========================================================
    # DIRETORES
    # ==========================================================

    def test_10_cadastra_diretor(self):

        print(colors.colorize(
            "\nTESTE 10: CADASTRA DIRETOR",
            "green"
        ))

        response = requests.post(
            f"{BASE_URL}/addCat",
            headers={
                "Authorization": f"Bearer {self.token_admin}"
            },
            data={
                "cat": "Diretores",
                "nome": "Denis Villeneuve",
                "genero": 1,
                "foto": "https://teste.com/denis.jpg"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

        diretores = response.json()

        diretor_criado = diretores[-1]

        self.__class__.diretor_id = diretor_criado["id"]

        print(colors.colorize(
            f"ID DIRETOR: {self.__class__.diretor_id}",
            "magenta"
        ))

    def test_11_busca_diretor_por_id(self):

        print(colors.colorize(
            "\nTESTE 11: BUSCA DIRETOR POR ID",
            "green"
        ))

        response = requests.get(
            f"{BASE_URL}/diretor?id={self.__class__.diretor_id}"
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

    def test_12_patch_diretor(self):

        print(colors.colorize(
            "\nTESTE 12: PATCH DIRETOR",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/diretor?id={self.__class__.diretor_id}",
            headers={
                "Authorization": f"Bearer {self.token_admin}",
                "Content-Type": "application/json"
            },
            json={
                "nome": "Denis",
                "sobrenome": "Villeneuve Editado",
                "foto": "https://teste.com/denis-editado.jpg"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

    def test_13_valida_patch_diretor(self):

        print(colors.colorize(
            "\nTESTE 13: VALIDA PATCH DIRETOR",
            "green"
        ))

        response = requests.get(
            f"{BASE_URL}/diretor?id={self.__class__.diretor_id}"
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

        diretor = response.json()

        print(colors.colorize(
            "Dados retornados:",
            "blue"
        ), diretor)

        self.assertEqual(
            diretor["sobrenome"],
            "Villeneuve Editado"
        )

        self.assertEqual(
            diretor["foto"],
            "https://teste.com/denis-editado.jpg"
        )

        print(colors.colorize(
            "PATCH do diretor validado com sucesso",
            "magenta"
        ))

    def test_14_patch_diretor_sem_token(self):

        print(colors.colorize(
            "\nTESTE 14: PATCH DIRETOR SEM TOKEN",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/diretor?id={self.__class__.diretor_id}",
            headers={
                "Content-Type": "application/json"
            },
            json={
                "nome": "Hack"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 401)

        print(colors.colorize(
            "401 validado com sucesso",
            "magenta"
        ))

    def test_15_patch_diretor_token_invalido(self):

        print(colors.colorize(
            "\nTESTE 15: PATCH DIRETOR TOKEN INVÁLIDO",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/diretor?id={self.__class__.diretor_id}",
            headers={
                "Authorization": "Bearer TOKEN_INVALIDO",
                "Content-Type": "application/json"
            },
            json={
                "nome": "Hack"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 401)

        print(colors.colorize(
            "401 validado com sucesso",
            "magenta"
        ))

    def test_16_patch_diretor_usuario_comum(self):

        print(colors.colorize(
            "\nTESTE 16: PATCH DIRETOR COM USER",
            "green"
        ))

        response = requests.patch(
            f"{BASE_URL}/diretor?id={self.__class__.diretor_id}",
            headers={
                "Authorization": f"Bearer {self.token_user}",
                "Content-Type": "application/json"
            },
            json={
                "nome": "Hack"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 403)

        print(colors.colorize(
            "403 validado com sucesso",
            "magenta"
        ))

    def test_17_deleta_diretor(self):

        print(colors.colorize(
            "\nTESTE 17: DELETA DIRETOR",
            "green"
        ))

        response = requests.delete(
            f"{BASE_URL}/diretores?id={self.__class__.diretor_id}",
            headers={
                "Authorization": f"Bearer {self.token_admin}"
            }
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 200)

        print(colors.colorize(
            "Diretor removido com sucesso",
            "magenta"
        ))

    def test_18_valida_delecao_diretor(self):

        print(colors.colorize(
            "\nTESTE 18: VALIDA DELEÇÃO DIRETOR",
            "green"
        ))

        response = requests.get(
            f"{BASE_URL}/diretor?id={self.__class__.diretor_id}"
        )

        print(colors.colorize("Status:", "blue"), response.status_code)
        print(colors.colorize("Resposta:", "blue"), response.text)

        self.assertEqual(response.status_code, 404)

        print(colors.colorize(
            "Deleção do diretor confirmada",
            "magenta"
        ))


if __name__ == "__main__":
    unittest.main()