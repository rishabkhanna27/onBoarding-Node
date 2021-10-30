const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
        case "string":
            return schema.replace(/\s+/, " ");
        default:
            return schema;
    }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

module.exports.register = Joi.object({
    password: Joi.string().required(),
    confirmPassword: Joi.ref("password"),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().optional(),
    phoneNo: Joi.string().regex(/^[0-9]{5,}$/).optional(),
    dialCode: Joi.string().regex(/^\+?[0-9]{1,}$/).optional(),
    image: Joi.string().allow("").optional(),
    deviceType: Joi.string().allow("WEB", "IOS", "ANDROID").optional(),
    deviceToken: Joi.string().optional(),
    timeZone : Joi.string().optional()
})
.with("password" , "confirmPassword")
.or("phoneNo" , "email")
.with("phoneNo" , "dialCode")

module.exports.login = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().optional(),
    phoneNo: Joi.string().regex(/^[0-9]{5,}$/).optional(),
    dialCode: Joi.string().regex(/^\+?[0-9]{1,}$/).optional(),
    deviceType: Joi.string().allow("WEB", "IOS", "ANDROID").optional(),
    deviceToken: Joi.string().optional(),
})
.or("phoneNo" , "email")
.with("phoneNo", "dialCode");

module.exports.updateProfile = Joi.object({
    email: Joi.string().email().optional().allow(""),
    phoneNo: Joi.string().allow("").optional(),
    dialCode: Joi.string().optional().allow(""),
    firstName: Joi.string().optional().allow(""),
    lastName: Joi.string().allow("").optional(),
    image: Joi.string().allow("").optional(),
    country: Joi.string().allow("").optional(),
    state: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
    address: Joi.string().optional().allow(""),
    latitude: Joi.string().optional(),
    longitude: Joi.string().optional(),
    timeZone: Joi.string().optional()
})