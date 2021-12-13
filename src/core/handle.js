const handle = async (observable) => {
    return new Promise((resolve, reject) => {
        try {
            observable
                .then((data) => {
                    resolve([null, data]);
                }).catch((err)=> {
                    reject([err, null]);
                    return {}
                });
        } catch (error) {
            reject([error, null]);
        }
    });
};

module.exports = handle;