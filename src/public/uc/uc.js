
async function firstUC() {
    const auth = new AuthenticationClientMirror();
    const response = await auth.reflect();
    const data = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
    auth.setRaw(data);
    const resp = await auth.keep();
    console.info("raw: ", auth.setRaw());

    return resp;
};

 // async function secondUC() {
        //     const auth = new AuthenticationClientMirror();
        //     const response = await auth.reflect();
        //     const resp = await auth.distort(response);
        //     const decipher = await auth.reform(resp.image.cipher);
        //     return decipher;
        // };

        // async function thirdUC() {
        //     const auth = new AuthenticationClientMirror();
        //     await auth.reflect();
        //     const response = await auth.reveal("Mussum Ipsum, cacilds vidis litro abertis. Per aumento de cachacis, eu reclamis.Praesent vel viverra nisi. Mauris aliquet nunc non turpis scelerisque, eget.Nullam volutpat risus nec leo commodo, ut interdum diam laoreet. Sed non consequat odio.Aenean aliquam molestie leo, vitae iaculis nisl.");
        //     auth.formBox.deform.origin = response.origin.cipher;
        //     // console.info("raw: ", auth.formBox);
        //     return response;
        // };

        // async function fourthUC() {
        //     const auth = new AuthenticationClientMirror();
        //     await auth.reflect();
        //     auth.setRaw("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam id quam non purus porta faucibus gravida et eros. Fusce luctus ante non lacus egestas facilisis. Nunc facilisis nibh nec magna accumsan varius. Integer interdum mauris nec massa luctus imperdiet. Cras ornare sem libero, et feugiat ligula gravida in. Aliquam sed neque ipsum. Mauris facilisis magna quis dolor condimentum, blandit lobortis massa rutrum. Duis semper augue nec sapien luctus venenatis.");
        //     await auth.keep();
        //     // return response;
        //     await auth.reflect();
        //     const res = await auth.refraction();
        //     return res;
        // };

        // async function fifthUC() {

        // };

        // result = await fourthUC();