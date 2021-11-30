const moment = require("moment");
const Model = require("../models/index");
const mongoose = require("mongoose");
const userService = require("../v1/controller/User");
const constant = require('../common/constants');
const CronJob = require('cron').CronJob;

module.exports.statusUpdatePicked = new CronJob('0 */1 * * *', async function () {
  try {
    var date = moment.utc().format();
    var local = moment.utc(date).local().format();
    let data, updateStatus;
    data = await Model.Event.find({
      $or: [{
        endDate: {
          $lt: new Date(local)
        },
        startDate: null
      }, {
        startDate: {
          $lt: new Date(local)
        },
        endDate: null
      }, {
        startDate: {
          $lt: new Date(local)
        },
        endDate: {
          $lt: new Date(local)
        }
      }],
      eventStatus: {
        $ne: constant.EVENT_STATUS.ENDED
      }
    });
    for (let i = 0; i < data.length; i++) {
      updateStatus = await Model.Event.findOneAndUpdate({
        _id: data[i]._id
      }, {
        eventStatus: constant.EVENT_STATUS.ENDED
      }, {
        new: true
      })
    }
    console.log("Cron Running every 1 hour");
  } catch (err) {
    console.log(err);
  }
});

module.exports.tokenExpire = new CronJob('* * * * *', async function () {
  try {
    var date = new Date(moment().add(330, 'm'))
    let data, updateStatus;
    data = await Model.User.find({
      isDeleted: false,
      tokenExpire: {$lte:date}
    });
    for (let i = 0; i < data.length; i++) {
      updateStatus = await Model.User.findOneAndUpdate({
        _id: data[i]._id
      }, {
        isMicrosoftSynced: false
      }, {
        new: true
      })
    }
    console.log("Cron Running every 1 minute");
  } catch (err) {
    console.log(err);
  }
});

async function startCronJobs() {
  await agenda.start();
  // await agenda.every("10 seconds", "scheduleEvents");
}