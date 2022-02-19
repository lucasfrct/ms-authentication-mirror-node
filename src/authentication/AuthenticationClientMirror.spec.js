import asdf from './AuthenticationClientMirror';

// jest.mock('./AuthenticationClientMirror');

describe('Teste de unidade para Authentication Client Mirror', () => {

    test('Authenticate Client Mirror', async() => {
        expect(asdf.displayName).toBe("CLIENT");
    });

})