const path = require("path");
const mongoose = require("mongoose");
const FCM = require('fcm-node');
const Model = require('../models/index');
const constant = require("../common/constants");
const apn = require("apn");
const apnProvider = new apn.Provider({
  token: {
    key: path.join(__dirname, '../common/AuthKey_GP4V5R97KN.p8'),
    keyId: config.get('apnKey.keyId'),
    teamId: config.get('apnKey.teamId')
  },
  production: false,
});
exports.sendAndroidPushNotifiction = sendAndroidPushNotifiction;
exports.sendIosPushNotification = sendIosPushNotification;
exports.preparePushNotifiction = preparePushNotifiction;
exports.sendWebPushNotifiction = sendWebPushNotifiction;
exports.sendPushNotifictionAccordingToDevice = sendPushNotifictionAccordingToDevice;

async function sendAndroidPushNotifiction(payload) {
  let fcm = new FCM(config.get('fcmKey.android'));
  var message = {
    to: payload.deviceToken || '',
    collapse_key: 'LASSO',
    data: payload
  };
  if (payload.isAdminNotification && payload.isNotificationSave) {
    new Model.AdminNotification(payload).save();
  }
  if (payload.isUserNotification && payload.isNotificationSave) {
    new Model.UserNotification(payload).save();
  }
  fcm.send(message, (err, response) => {
    if (err) {
      console.log('Something has gone wrong!', err);
    } else {
      console.log('Push successfully sent!');
    }
  });
}
async function sendIosPushNotification(payload) {
  try {
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.sound = "ping.aiff";
    note.badge = 3;
    note.alert = {
      title: payload.title,
      body: payload.message
    };
    note.topic = config.get('apnKey.bundleId') ////////////////////////////////
    note.payload = payload;
    const result = await apnProvider.send(note, payload.deviceToken)
    console.log(result, "result");
    result.sent.forEach(token => {
      console.log("Notification sent to " + token)
    })
    result.failed.forEach(failure => {
      if (failure.error) {
        console.log("Error : " + failure.error.message)
      } else {
        console.log("Failure Status : " + failure.status)
        console.log("Failure response : " + failure.response.reason)
        console.log("Failure device : " + failure.device)
      }
    })

    if (payload.isAdminNotification && payload.isNotificationSave) {
      new Model.AdminNotification(payload).save();
    }
    if (payload.isUserNotification && payload.isNotificationSave) {
      new Model.UserNotification(payload).save();
    }
  } catch (error) {
    console.log(error, "error")
  }
}
async function sendWebPushNotifiction(payload) {

  if (payload.isDriverNotification && payload.isNotificationSave) {
    new Model.DriverNotificationModel(payload).save();
  }
  if (payload.isResturantNotification && payload.isNotificationSave) {
    new Model.ResturantNotificationModel(payload).save();
  }
  if (payload.isAdminNotification && payload.isNotificationSave) {
    new Model.AdminNotificationModel(payload).save();
  }
  fcm.send(message, (err, response) => {
    if (err) {
      console.log('Something has gone wrong!', err);
    } else {
      console.log('Push successfully sent!');
    }
  });
}
async function saveNotifiction(payload) {
  if (payload.isAdminNotification && payload.isNotificationSave) {
    new Model.AdminNotification(payload).save();
  }
  if (payload.isUserNotification && payload.isNotificationSave) {
    new Model.UserNotification(payload).save();
  }
}
async function sendPushNotifictionAccordingToDevice(deviceData, payload) {
  let deviceToken = deviceData.deviceToken;
  let deviceType = deviceData.deviceType;
  payload.deviceToken = deviceToken;
  switch (deviceType) {
    case "ANDROID":
      sendAndroidPushNotifiction(payload);
      break;
    case "IOS":
      sendIosPushNotification(payload);
      break;
    case "WEB":
      sendWebPushNotifiction(payload);
      break;
    default:
      console.log('Invalid device type');
      break;
  }
  return true;
}
async function preparePushNotifiction(payloadData, userType) {
  let payload = JSON.parse(JSON.stringify(payloadData));
  if (payload && payload.data)
    delete payload.data;
  if (payload && payload.keys)
    delete payload.keys;
  if (userType == constant.PUSHROLE.ADMIN) {
    saveNotifiction(payload)
  } else if (userType == constant.PUSHROLE.USER) {
    const deviceData = await Model.User.findOne({
      _id: payload.userId
    })
    if (deviceData) {
      // let messagepending = await Model.UserNotification.countDocuments({
      //   userId: payload.userId._id,
      //   isRead: false
      // })
      // payload.pendingmsg = 1;
      // if (messagepending != 0) {
      //   payload.pendingmsg = messagepending + 1;
      // }
      sendPushNotifictionAccordingToDevice(deviceData, payload);
    } else {
      console.log('No user device data found.')
    }
  }
}