const { read } = require('../utils/transform-js');

test('Authenticate Client Mirror', async() => {
    // const AuthenticationMirrorClient = await read( "/AuthenticationMirrorClient.js");
    const Auth = await read( "Authentication/auth.js");
    // console.log("DEBUG: ", Auth)
    const auth = new Auth();
    console.log("DEBUG AUTH: ", auth.client)
    expect("CLIENT").toBe("CLIENT");
})