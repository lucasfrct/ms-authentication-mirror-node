# ms-authentication-mirror
Microserviço feito para trocar de chaves e cifras entre **cliente** e **servidor** garantindo uma comunicação segura no ambiente virtual.
Fornecemos um serviço de criptografia fácil de ser utilizado usando o padrão RSA.

O uso é simples, disponibilizamos uma classe de configuração para o **cliente** que contém toda a lógica de acesso e troca de informação no padrão REST.
## Payload para troca de informação
A aplicação usa um único payload para troca de informações durante toda a requisição, ou seja, tanto o **request** quanto **response** usam a mesma estrutura do objeto JSON.
A estrutura interna está organizada em dois sub-objetos: **origin** e **destiny**, onde origin são dados do **cliente** e destiny sáo dados do **servidor**.
``` Estrutura do payload completa:
    reflex = {
        origin:     { public: "", cipher: "", body: {} },
        destiny:    { public: "", cipher: "", body: {} },
    };
```
``` Estrutura interna do origin (origem é referente aos dados do cliente)
    origin: { public: "", cipher: "", body: {} }
```
``` Estrutura interna do destiny (imagem é referente aos dados do servidor)
    destiny: { public: "", cipher: "", body: {} }
```
Os dados do objeto persistem de modo que todas as alterações feitas pelo **servidor** normalmente estarão dentro do sub-objeto **destiny** e todas as alterações feitas pelo **cliente** estarão no sub-objeto **origin**.

## REST

[x] /authentication/miror/lib : Baixando a biblioteca authentication-mirror-client.lib.js
``` GET /authentication/mirror/lib
```
### Rota reflect
- O **cliente** envia o objeto reflex com sua chave publica para o **servidor**, **servidor** insere no reflex sua própria chave publica,  e responde o reflex para o **cliente** que agora possui as duas chaves públicas.
- [x] /authentication/mirror/reflect : Enviando a chave publica do **cliente** e recebendo a chave publica do **servidor**
``` POST /authentication/mirror/reflect
    Headers: x-api-token: token

    Request: {
        origin:     { public: "chave-pública-do-cliente",   cipher: "", body: {} },
        destiny:    { public: "",                           cipher: "", body: {} },
    };

    Response: {
        origin:     { public: "chave-pública-do-cliente",   cipher: "", body: {} },
        destiny:    { public: "chave-pública-do-servidor",  cipher: "", body: {} },
    };
```
### Rota keep
- O **cliente** envia o objeto reflex com uma cifra para o **servidor**, o **servidor** por sua vez decifra, armazena na classe e responde o reflex para o **cliente**.
- [x] /authentication/mirror/keep : Enviando uma cifra do **cliente** para que o **servidor** decifre e armazene
``` POST /authentication/mirror/keep
    Headers: x-api-token = token

    Request: {
        origin:     { public: "chave-pública-do-cliente",   cipher: "cifra-docliente", body: {} },
        destiny:    { public: "",                           cipher: "", body: {} },
    };

    Response: {} | status: 202 - Accepted
```
### Rota distort
- O **cliente** envia o objeto reflex com a cifra do **cliente** para o **servidor**, o **servidor** decifra a cifra do **cliente**, faz uma cifra para resposta com a pública do **cliente**, insere no reflex, responsde e o **cliente** decrifra a cifra do **servidor** com a sua própria chave privada.
- [x] /authentication/mirror/distort : Trocando cifra enter cliente e servidor e decifrndo de ambos os lados.
```POST /authentication/mirror/distort
    Headers: x-api-token = token

    Request: {
        origin:     { public: "chave-pública-do-cliente",   cipher: "cifra-do-cliente", body: {} },
        destiny:    { public: "chave-pública-do-servidor",  cipher: "",                 body: {} },
    };

    Response: {
        origin:     { public: "chave-pública-do-cliente",   cipher: "cifra-do-cliente",     body: {} },
        destiny:    { public: "chave-pública-do-servidor",  cipher: "cifra-do-servidor",    body: {} },
    };
```
### Rota reveal
- O **cliente** envia o objeto reflex com o dado cru e a chave pública do **cliente** para o **servidor**, o **servidor** por sua vez cifra o dado cru recebido com a chave pública do **cliente**, insere a cifra no reflex e o responde o reflex com a chave pública do **cliente** e uma cifra feita com a chave pública do **cliente**.
- [x] /authentication/mirror/reveal : Enviando um dado para recebê-lo encriptado
``` POST /authenticate/mirror/reveal
    Headers: x-api-token = token
   
    Request: {
        origin:     { public: "chave-pública-do-cliente",   cipher: "", body: { raw: "dado-do-cliente" } },
        destiny:    { public: "chave-pública-do-servidor",  cipher: "", body: {}                         },
    };

    Response: {
        origin:   { public: "chave-pública-do-cliente",   cipher: "cifra-do-cliente", body: { raw: "dado-do-cliente" } },
        destiny:  { public: "chave-pública-do-servidor",  cipher: "",                 body: {}                         },
    };
```
## Casos de uso

- 1. O **cliente** obtém a chave publica do **servidor**, cifra um dado com a chave pública do **servidor**, envia a cifra para o **servidor**, o **servidor** decifra e guarda no banco de dados.
```/authentication/mirror/keep```

- 2. O **cliente** obtém uma chave pública do **servidor**, cifra uma dado com a chave pública do **servidor**, envia a chave pública do **cliente** junto coma cifra para o **servidor**. O **servidor** recebe a chave pública do **cliente** e uma cifra do **cliente** feita coma chave pública do **servidor**, então o **servidor** decifra a cifra do **cliente** com a chave privada do **servidor** e cifra um dado do banco de dados com a chave pública do **cliente**. O **servidor** devolve uma nova cifra para o **cliente** e o **cliente** decifra a cifra do **servidor** com sua chave privada do cliente.
```/authentication/mirror/distort```

- 3. O **cliente** envia um dado e a chave pública para o **servidor**, o **servidor** cifra o dado do **cliente** com a chave pública do **cliente** e devolve a cifra para o **cliente**.
```/authentication/mirror/reveal```

- 4. **SERVIDOR TURN**:  O **cliente 1** pede uma id-turn para o **servidor**, com a id-turn o **cliente 1** cifra um dado com a chave pública do **servidor** e envia a cifra e o id-turn para o **servidor**. O **servidor** decifra a cifra do o **cliente 1**  e guarda no bando de dados o dados decifado e a id-turn do **cliente 1**. O **cliente 2** envia para o servidor a id-turn do **cliente 1** e a chave pública do **cliente 2**, o **servidor** busca no banco de dados a id-turn do **cliente 1** enviada pelo **cliente 2** e crifra o dado do **cliente 1** com a chave pública do **cliente 2** e responde a requisição com a cifra dos dados do **cliente 1** para o **cliente 2** que recebe a cifra e decifra com a chave privada do **cliente 2**.
    -  obter id-turn (GET): ```/authentication/mirror/detour```
    -  guradar dados com id-turn (POST)```/authentication/mirror/refraction/{id-turn}```
    -  recuperar dados com id-turn (GET)```/authentication/mirror/refraction/{id-turn}```
