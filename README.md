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
[x] /session : Iniciando login
``` POST /session
    Request: { email: "", password: "" }
    Response: { uudi: "", token: "" }
```
[x] /authenticate/mirror/reveal : Enviando um dado para recebê-lo encriptado
``` POST /authenticate/mirror/reveal
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
[x] /authenticate/mirror/reflect : Enviando a chave publica do cliente e recebendo a chave publica do servidor
``` POST /authenticate/mirror/reflect
    Headers: x-api-token = token
    Request: { origin: { public: "{CHAVE PUBLICA DO CLIENTE}", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "{CHAVE PUBLICA DO CLIENTE}", cipher: "", raw: "" }, image: { public: "{CHAVE PUBLICA DO SERVIDOR}", cipher: "", raw: "" } }
```
[x] /authenticate/mirror/distort : Enviando o objeto para receber uma cifra do servidor
``` POST /authenticate/mirror/distort
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
[x] /authenticate/mirror/keep : Enviando uma cifra para que o servidor decifre e armazene
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