const logger    = require('@ms-utils-node/src/core/logger-handler');
const Err       = require('@ms-utils-node/src/core/error-handler');

const User = require("../user/User");

const Authorization = class Authorization {
    user = null

    constructor() {
        this.user = new User();
    }

    async create(payload = {}) {
        return await this.user.create(payload);
    }

    /**
     * Busca uuid usuário no banco de dados
     * @param data: string 
     * @returns 
     */
    async verify(data = {}) {
        const { uuid } = await this.user.readOne(data);
        return uuid || "";
    }
}

module.exports = Authorization;