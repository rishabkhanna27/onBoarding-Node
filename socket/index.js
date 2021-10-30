const admin = require("./adminSockets");
const user = require("./UserSockets");
const io = require("socket.io");
const constant = require('../common/constants');
const universalFunction = require("../common/authenticate");
const pushNotificationService = require('../services/PushNotificationService')
const Model = require('../models/index')

module.exports = io => {
  io.on("connection", socket => {
    console.log("connected to sockets");
    // Resturant(io, socket);
    admin(io, socket);
    // driver(io, socket);
    user(io, socket);
    socket.on("disconnect", async function () {
      console.log("Disconnect", socket.id);
      await Model.User.findOneAndUpdate({
        socketId: socket.id
      }, {
        $set: {
          isActive: false,
          socketId: null
        }
      }, {
        new: true
      })
    });
  });
  process.on("sendNotificationToAdmin", async function (payloadData) {
    try {
      if (payloadData && payloadData.adminId) {
        payloadData.pushType = payloadData.pushType ? payloadData.pushType : 0;
        let lang = payloadData.lang || "en";
        let values = payloadData.values ? payloadData.values : {};
        let inputKeysObj = constant.PUSH_TYPE[payloadData.pushType];
        let eventType = payloadData.eventType || null;
        let data = await universalFunction.renderTemplateField(
          inputKeysObj,
          values,
          lang,
          eventType,
          payloadData
        );
        io.to(payloadData.adminId).emit('sendNotificationToAdmin', data);
        pushNotificationService.preparePushNotifiction(data, constant.PUSHROLE.ADMIN);
      }
    } catch (err) {
      console.log(err)
    }
  });
  process.on("sendNotificationToUser", async function (payloadData) {
    try {
      if (payloadData && payloadData.userId) {
        payloadData.pushType = payloadData.pushType ? payloadData.pushType : 0;
        let lang = payloadData.lang || "en";
        let values = payloadData.values ? payloadData.values : {};
        let inputKeysObj = constant.PUSH_TYPE[payloadData.pushType];
        let eventType = payloadData.eventType || null;
        let data = await universalFunction.renderTemplateField(
          inputKeysObj,
          values,
          lang,
          eventType,
          payloadData
        );
        io.to(payloadData.userId).emit('sendNotificationToUser', data);
        pushNotificationService.preparePushNotifiction(data, constant.PUSHROLE.USER);
      }
    } catch (err) {
      console.log(err)
    }
  });
  process.on("pending_count", async function (payloadData) {
    try {
      let dataToSend = {}
      let pendingInvitationCount = await Model.UserNotification.countDocuments({
        userId: ObjectId(payloadData.userId),
        isRead: false
      })
      dataToSend.pendingInvitationCount = pendingInvitationCount
      dataToSend.userId = payloadData.userId
      let check = await Model.CountMessage.find({
        userId: ObjectId(payloadData.userId),
        count: {
          $ne: 0
        }
      });
      let teamId = 0,
        eventId = 0,
        groupId = 0,
        receiverId = 0;
      if (check.length > 0) {
        for (let i = 0; i < check.length; i++) {
          if (check[i].teamId) {
            teamId++
          } else if (check[i].eventId) {
            eventId++
          } else if (check[i].groupId) {
            groupId++
          } else if (check[i].receiverId) {
            receiverId++
          }
        }
      }
      count = Number(teamId) + Number(eventId) + Number(groupId) + Number(receiverId)
      dataToSend.count = count
      console.log(dataToSend, "dataToSend");
      io.to(payloadData.userId).emit("pending", {
        dataToSend
      });

    } catch (error) {
      console.log(error)
    }
  });
};