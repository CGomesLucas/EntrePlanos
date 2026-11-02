from http.server import HTTPServer
from api.endpoints import MyHandler
from etc.colors import Colors
from config import HOST, PORT

colors = Colors()

def main():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, MyHandler)
    print(colors.colorize('Servidor rodando em:\n\nhttp://localhost:8000\n', "magenta"))
    httpd.serve_forever()

if __name__ == "__main__":
    main()
