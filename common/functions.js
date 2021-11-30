const _ = require("lodash");
const {
    nanoid,
    customAlphabet
} = require("nanoid");
const Handlebars = require("handlebars");

//Helper functions
module.exports.generateString = (length) => nanoid(length);
module.exports.generateNumber = (length) => customAlphabet("123456789", length)();
module.exports.generateCustom = (length, charset) => customAlphabet(charset, length)();
module.exports.toHex = (val) => Buffer.from(val, "utf8").toString("hex");
module.exports.toStr = (val) => Buffer.from(val, "hex").toString("utf8");
module.exports.generateRandomStringAndNumbers = function (len) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz1234567890";
    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};
module.exports.setPrecision = async (no, precision) => {
    precision = precision || 3;
    if (!isNaN(no)) {
        return (+(Math.round(+(no + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
    } else {
        return 0;
    }
};
module.exports.prettyCase = (str) => {
    if (typeof str === "string" && /^[A-Z_]+$/.test(str)) {
        str = _.lowerCase(str);
        str = _.startCase(str);
    }
    return str;
};
module.exports.toDecimals = (val, decimal = 2) => {
    const base = Math.pow(10, decimal);
    return Math.round(val * base) / base;
};
module.exports.toObject = (data, key, val) => {
    if (!Array.isArray(data)) throw new Error("INVALID_DATA");
    if (!key || typeof key !== "string") throw new Error("INVALID_KEY");

    const newObj = {};
    if (data.length > 0) {
        for (const item of data) {
            newObj[item[key] + ""] = !!val ? item[val] : item;
        }
    }
    return newObj;
};

//Render function
module.exports.renderTemplateField = async (inputKeysObj, values, lang, eventType = null, payloadData) => {
    lang = lang || "en";
    let sendObj = {};
    sendObj.adminId = payloadData.adminId ? payloadData.adminId : null;
    sendObj.receiverId = payloadData.receiverId ? payloadData.receiverId : null;
    sendObj.userId = payloadData.userId ? payloadData.userId : null;
    sendObj.postId = payloadData.postId ? payloadData.postId : null;
    sendObj.isAdminNotification = payloadData.isAdminNotification ? payloadData.isAdminNotification : false;
    sendObj.isUserNotification = payloadData.isUserNotification ? payloadData.isUserNotification : false;
    sendObj.isNotificationSave = payloadData.isNotificationSave ? payloadData.isNotificationSave : false;
    sendObj.pushType = payloadData.pushType ? payloadData.pushType : 0;
    sendObj.eventType = payloadData.eventType ? payloadData.eventType : null;
    if (values)
        values = JSON.parse(JSON.stringify(values));

    let keys = inputKeysObj.keys || [];
    for (let i = 0; i < keys.length; i++) {
        keys[i].value = values[keys[i].key];
    }
    var source = inputKeysObj.message[lang] || null;
    var template = Handlebars.compile(source) || null;
    var message = template(values) || payloadData.values;
    source = inputKeysObj.title[lang] || null;
    template = Handlebars.compile(source) || null;
    var title = template(title) || payloadData.title;
    sendObj.message = message;
    sendObj.title = title;
    sendObj.keys = keys;
    sendObj.data = values;
    sendObj.eventType = eventType;
    return sendObj;
};

