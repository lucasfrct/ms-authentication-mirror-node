
const handle = (promise)=> {
    return new Promise((resolve)=> {
        try {
            promise
                .then((data)=> { resolve([null, data]); })
                .catch((e)  => { resolve([e, null]);    })
        } catch (e) {
            resolve([e, null]);
        }
    })
};

module.exports = handle;