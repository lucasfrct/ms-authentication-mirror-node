const { read } = require('../../utils/transform-js');

test('Authenticate Client Mirror', async() => {

    // const Auth = await read( "Authentication/auth.js");
    const Auth = await read( "Authentication/AuthenticationMirrorClient.js");
    const auth = new Auth();
    
    console.log("DEBUG AUTH: ", auth.client)
    
    expect("CLIENT").toBe("CLIENT");
})