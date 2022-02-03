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
[x] /reveal : Enviando um dado para recebê-lo encriptado
``` POST /reveal
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
[x] /reflect : Enviando a chave publica do cliente e recebendo a chave publica do servidor
``` POST /reflect
    Headers: x-api-token = token
    Request: { origin: { public: "{CHAVE PUBLICA DO CLIENTE}", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "{CHAVE PUBLICA DO CLIENTE}", cipher: "", raw: "" }, image: { public: "{CHAVE PUBLICA DO SERVIDOR}", cipher: "", raw: "" } }
```
[x] /distort : Enviando o objeto para receber uma cifra do servidor
``` POST /distort
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
[x] /keep : Enviando uma cifra para que o servidor decifre e armazene
``` POST /keep
    Headers: x-api-token = token
    Request: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    Response: { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
```
[x] /hybrid-crypto-js : Importando a biblioteca hybrid-crypto
``` GET /hybrid-crypto-js
```
[x] /js-sha512 : Importando a biblioteca js-sha512
``` GET /js-sha512
```
[x] /client : Importando a classe do cliente
``` GET /client
```