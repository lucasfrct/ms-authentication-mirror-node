# olombongo-ms-mirror-key-node
Troca de chaves e cifras
Comunicação segura
Serviço de criptografia
Padrão RSA
Fornece classes de configuração
Padrão de consumo REST

## Payload para troca de informação
A aplicação usa um único payload para troca de informações durante toda a requisição, ou seja, tanto o request quanto response usam a mesma estrutura do objeto JSON.
A estrutura interna está organizada em dois objetos: origin e image, que são um o reflexo do outro como demonstrado abaixo:
``` Estrutura do payload completa:
    { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
``` Estrutura interna do origin (origem é referente aos dados do cliente)
    origin: { public: "", cipher: "", raw: "" }
```
``` Estrutura interna da image (imagem é referente aos dados do servidor)
    image: { public: "", cipher: "", raw: "" }
```
Os dados do objeto persistem de modo que todas as alterações feitas pelo servidor normalmente estarão dentro do objeto image e todas as alterações feitas pelo cliente estarão no objeto origin.

## URIs
- [x] /session : Iniciando login
``` POST /session
    Request: { email: "", password: "" }
    Response: { uudi: "", token: "" }
```
- [x] /authenticate/mirror/reveal : Enviando um dado para recebê-lo encriptado
``` POST /authenticate/mirror/reveal
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
- [x] /authenticate/mirror/reflect : Enviando a chave publica do cliente e recebendo a chave publica do servidor
``` POST /authenticate/mirror/reflect
    Headers: x-api-token = token
    Request: { origin: { public: "{CHAVE PUBLICA DO CLIENTE}", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { 
        origin: { public: "{CHAVE PUBLICA DO CLIENTE}", cipher: "", raw: "" }, 
        image: { public: "{CHAVE PUBLICA DO SERVIDOR}", cipher: "", raw: "" } 
    }
```
- [x] /authenticate/mirror/distort : Enviando o objeto para receber uma cifra do servidor
``` POST /authenticate/mirror/distort
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
- [x] /authenticate/mirror/keep : Enviando uma cifra para que o servidor decifre e armazene
``` POST /authenticate/mirror/keep
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
[x] /authenticate/hybrid-crypto-js : Baixando a biblioteca hybrid-crypto
``` GET /authenticate/hybrid-crypto-js
```
[x] /authenticate/js-sha512 : Baixando a biblioteca js-sha512
``` GET /authenticate/js-sha512
```
[x] /authenticate/client/mirror : Baixando a biblioteca do cliente
``` GET /authenticate/client/mirror
```

Autenticação do usuario
- login: email e senha
- session: token

Criar um arquivo só com essas librarys - o nome do arquivo client-mirror-autentication.js
- src/authentication/AuthenticationClientMirror.js
- src/lib/hybrid-crypto/hybrid-crypto-js.js
- src/lib/js-sha521/js-sha512.js

path do arquivo de cliente
- src/public/client-mirror-autentication.js

Rota reflect
- O cliente envia o objeto reflex com sua chave publica para o servidor, o servidor por sua vez lê sua chave publica, insere no reflex e responde o reflex.

Rota distort
- Envia o objeto reflex com o dado e a chave publica do cliente para o servidor, o servidor por sua vez cifra o dado recebido no reflex com a chave publica do cliente, insere a cifra no reflex e o responde o reflex.
Servidor precisa distorcer um dado

Rota reveal
- Envia o objeto reflex com o dado e a chave publica do cliente para o servidor, o servidor por sua vez cifra o dado recebido no reflex com a chave publica do cliente, insere a cifra no reflex e o responde o reflex.

Rota keep
- Envia o objeto reflex com uma cifra para o servidor, o servidor por sua vez decifra, armazena na classe e responde o reflex.

## Casos de uso
- 1. O cliente obtém a chave publica do servidor, cifra um dado com a chave publica do servidor, envia a cifra para o servidor, o servidor decifra e guarda no banco de dados. URL /keep
- 2. O cliente envia sua chave publica para o servidor, o servidor cifra um dado do banco de dados, o servidor devolve a cifra para o cliente e o cliente decifra com sua chave privada.
- 3. O cliente envia um dado para o servidor, o servidor cifra com sua chave publica, o servidor devolve uma cifra para o cliente, o cliente envia a cifra para seus pares e somente o servidor pode decifrar com a chave privada.
- 4. (Servidor como TURN) O cliente cifra um dado com a chave publica do servidor, o servidor decifra, recifra com a chave publica do cliente2, envia para cliente2, o cliente2 decifra com sua privada.
- 5. Cliente cifra a sua chave privada com a chave publica do cliente2, envia a cifra para o servidor, o servidor redireciona para o cliente2. (Usar Socket)