const jwt = require("jsonwebtoken");
const Model = require("../models");
const Handlebars = require("handlebars");

module.exports.getToken = (data) =>
  jwt.sign(data, config.get('JWT_SERVICE.SECRET_KEY'), {
    expiresIn: "30 days"
  });

module.exports.verifyToken = (token) =>
  jwt.verify(token, config.get('JWT_SERVICE.SECRET_KEY'));

module.exports.verify = (...args) => async (req, res, next) => {
  try {
    const roles = [].concat(args).map((role) => role.toLowerCase());
    const token = String(req.headers.authorization || "")
      .replace(/bearer|jwt/i, "")
      .replace(/^\s+|\s+$/g, "");
    let decoded;
    if (token) decoded = this.verifyToken(token);
    let doc = null;
    let role = "";
    if (!decoded && roles.includes("guest")) {
      role = "guest";
      return next();
    }
    if (decoded != null && roles.includes("user")) {
      role = "user";
      doc = await Model.User.findOne({
        _id: decoded._id,
        accessToken: token,
        isBlocked: false,
        isDeleted: false,
      });
    }
    if (decoded != null && roles.includes("admin")) {
      role = "admin";
      doc = await Model.Admin.findOne({
        _id: decoded._id,
        accessToken: token,
        isBlocked: false,
        isDeleted: false,
      });
    }
    if (!doc) {
      return res.send({
        "statusCode": 401,
        "message": "Invalid Token",
        "data": {},
        "status": 0,
        "isSessionExpired": true
      })
    };
    if (role) req[role] = doc.toJSON();
    next();
  } catch (error) {
    console.error(error);
    const message =
      String(error.name).toLowerCase() === "error" ?
      error.message :
      "UNAUTHORIZED_ACCESS";
    return res.error(401, message);
  }
};

module.exports.renderTemplateField = async (inputKeysObj, values, lang, eventType = null, payloadData) => {
  lang = lang || "en";
  let sendObj = {};
  sendObj.eventId = payloadData.eventId ? payloadData.eventId : null;
  sendObj.groupId = payloadData.groupId ? payloadData.groupId : null;
  sendObj.userId = payloadData.userId ? payloadData.userId : null;
  sendObj.adminId = payloadData.adminId ? payloadData.adminId : null;
  sendObj.senderId = payloadData.senderId ? payloadData.senderId._id : null;
  sendObj.teamId = payloadData.teamId ? payloadData.teamId : null;
  sendObj.notificationType = payloadData.notificationType ? payloadData.notificationType : 2;
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
  var source = inputKeysObj.message[lang];
  var template = Handlebars.compile(source);
  var message = template(values);
  source = inputKeysObj.title[lang];
  template = Handlebars.compile(source);
  var title = template(values);
  sendObj.message = message;
  sendObj.title = title;
  sendObj.keys = keys;
  sendObj.data = values;
  sendObj.eventType = eventType;
  return sendObj;
};