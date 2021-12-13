const UserModel = require("./User.model");
const { v4: uuidv4 } = require('uuid');

const User = class User {

    instance = null
    table = "user"
    
    uid = "";
    uuid = "";
    ex_uuid = ""; // external uuid
    name = "";
    password = "";
    email = "";
    cellphone = "";
    doc = "";	

    constructor() {}

    async create(data = {}) {
        try {
            const result = await UserModel.create({ ...data, uuid: uuidv4() });
            if(result?._options?.isNewRecord) {
                const { dataValues: { uuid } } = result;
                return uuid;
            };
        } catch (e) {
            return ""
        }
    }

    async readOne(data) {
        try{
            const { dataValues: user } = await UserModel.findOne({ attributes: ['uuid'], where: data });
            return user;
        } catch(e) {
            return "";
        }
    }
    
};

module.exports = User;
