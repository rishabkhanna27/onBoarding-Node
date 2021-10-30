const moment = require("moment");
const Model = require("../models/index");
const mongoose = require("mongoose");
const userService = require("../v1/controller/User");
const constant = require('../common/constants');
const CronJob = require('cron').CronJob;

// const moment = require('moment');



let db = null;
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
MongoClient.connect(url, function (err, client) {
  db = client.db("test");
});
const Agenda = require("agenda");

exports.startCronJobs = startCronJobs;

const agenda = new Agenda({
  db: {
    address: "mongodb://localhost:27017/aaron",
    collection: "scheduledevents",
  },
  processEvery: '30 seconds'
});

agenda.define("scheduleEvents", {
  priority: 'high'
}, async (job) => {
  let jobData = job.attrs.data;
  if (jobData.orderData.startDate) {
    if (jobData && jobData.orderData && jobData.orderData._id) {
      userService.cronForAutoAllocation(jobData.orderData);
      job.remove(function (err) {
        if (!err) {}
        console.log("Successfully removed  job from collection");
      });
    }
  }
});

agenda.define("scheduleEventsData", {
  priority: 'high'
}, async (job) => {
  let jobData = job.attrs.data;
  if (jobData.orderData.endDate) {
    if (jobData && jobData.orderData && jobData.orderData._id) {
      userService.cronForAutoEnd(jobData.orderData);
      job.remove(function (err) {
        if (!err) {}
        console.log("Successfully removed  job from collection");
      });
    }
  }
});

process.on("scheduleEvents", async (payload) => {
  let orderData = JSON.parse(JSON.stringify(payload));
  let agendaPayload = {
    orderData: orderData
  }
  if (orderData && orderData._id) {
    let checkDelete = await db.collection('scheduledevents').deleteMany({
      "data.orderData._id": orderData._id
    })
  }
  if (orderData && orderData.startDate) {
    await agenda.schedule(moment(orderData.startDate).subtract(330, 'm').toDate(), "scheduleEvents", agendaPayload);
  }
  if (orderData && orderData.endDate) {
    await agenda.schedule(moment(orderData.endDate).subtract(330, 'm').toDate(), "scheduleEventsData", agendaPayload);
  }
});

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