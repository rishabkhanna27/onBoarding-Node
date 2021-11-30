const Model = require('../models/index');
const mongoose = require('mongoose');
const constants = require('../common/constants');
const ObjectId = mongoose.Types.ObjectId;
const _ = require("lodash");
const flatten = require("flat");
const moment = require('moment');

module.exports = (io, socket) => {
  socket.on("onlineUser", async function (data) {
    try {
      console.log("onlineUser");
      if (data && data.userId) {
        await Model.User.findOneAndUpdate({
          _id: ObjectId(data.userId)
        }, {
          $set: {
            socketId: socket.id,
            isActive: true
          }
        }, {
          new: true
        })
        let pendingInvitationCount = await Model.UserNotification.countDocuments({
          userId: ObjectId(data.userId),
          isRead: false
        })
        let count = 0
        let check = await Model.CountMessage.find({
          userId: ObjectId(data.userId),
          count: {
            $ne: 0
          }
        });
        if (check.length > 0) {
          let teamId = 0,
            eventId = 0,
            groupId = 0,
            receiverId = 0;
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
          count = Number(teamId) + Number(eventId) + Number(groupId) + Number(receiverId)
        }
        socket.join(data.userId);
        io.to(socket.id).emit("onlineUserOk", {
          status: 200,
          data: {
            pendingInvitationCount,
            count
          }
        });
      }
    } catch (error) {
      console.error(error || error.message)
      io.to(data.userId).emit('falseListner', {
        sucess: 400,
        error: error.message
      });
    }
  });
  socket.on("userList", async function (data) {
    try {
      console.log("userList")
      let EventData = [],
        TeamData = [],
        groupData = [],
        userListData = [];
      let search = data.search

      let checkEvent = await Model.Event.find({
        $or: [{
          userId: ObjectId(data.userId)
        }, {
          acceptedList: ObjectId(data.userId)
        }],
        isDeleted: false
      }, {
        eventName: 1,
        description: 1,
        eventImage: 1,
        chatId: 1
      })
      if (checkEvent.length > 0) {
        for (let i = 0; i < checkEvent.length; i++) {
          let isRead = true;
          let check = await Model.CountMessage.findOne({
            userId: ObjectId(data.userId),
            eventId: checkEvent[i]._id,
            count: {
              $ne: 0
            }
          });
          if (check != null) {
            isRead = false
          }
          let criteria = {
            roomId: checkEvent[i].chatId
          }
          let checkChatDate = await Model.UserDeleteChat.findOne({
            userId: ObjectId(data.userId),
            roomId: checkEvent[i].chatId,
            chatDate: {
              $ne: null
            }
          })
          if (checkChatDate != null) {
            criteria.createdAt = {
              $gte: new Date(moment(checkChatDate.chatDate))
            }
          }
          let lastMessageData = await Model.chatMessage.find(criteria).sort({
            createdAt: -1
          })
          if (lastMessageData.length > 0) {
            if(lastMessageData[0].message == null)
            lastMessageData[0].message = `📷  Media`
            let obj = {
              name: checkEvent[i].eventName,
              image: checkEvent[i].eventImage,
              _id: checkEvent[i]._id,
              description: checkEvent[i].description,
              roomId: checkEvent[i].chatId,
              type: 4,
              eventId: checkEvent[i]._id,
              lastMessag: lastMessageData[0],
              lastMessageTime: lastMessageData[0].createdAt
            }
            obj.isRead = isRead
            EventData.push(obj);
          }
        }
        if (search != "" && search != null) {
          let finalSearchData = [];
          for (let i = 0; i < EventData.length; i++) {
            finalSearchData.push({
              eventName: EventData[i].name,
              _id: EventData[i]._id
            })
          }
          let dataService = _.filter(finalSearchData, (itm) => {
            const val2Str = Object.values(flatten(itm)).join("");
            return _.includes(val2Str.toLowerCase(), search.toLowerCase());
          });
          if (dataService.length == 0) {
            EventData = [];
          }
          let result1 = []
          for (let j = 0; j < dataService.length; j++) {
            let serviceData = await Model.Event.findOne(dataService[j], {
              eventName: 1,
              description: 1,
              eventImage: 1,
              chatId: 1
            })
            if (serviceData != null) {
              result1.push(serviceData)
            }
          }
          let jsonObject = result1.map(JSON.stringify);
          let uniqueSet = new Set(jsonObject);
          let resultData = Array.from(uniqueSet).map(JSON.parse);
          EventData = resultData;
          let EventDataa = []
          for (let i = 0; i < EventData.length; i++) {
            let lastMessageData = await Model.chatMessage.find({
              roomId: EventData[i].chatId
            }).sort({
              createdAt: -1
            })
            if (lastMessageData.length > 0) {
              let obj = {
                name: EventData[i].eventName,
                image: EventData[i].eventImage,
                _id: EventData[i]._id,
                description: EventData[i].description,
                roomId: EventData[i].chatId,
                type: 4,
                eventId: EventData[i]._id,
                lastMessag: lastMessageData[0],
                lastMessageTime: lastMessageData[0].createdAt
              }
              EventDataa.push(obj);
            }
          }
          EventData = EventDataa
        }
        for (let i = 0; i < EventData.length; i++) {
          let checkMute = await Model.AddMute.findOne({
            chatId: EventData[i].roomId,
            isDeleted: false
          });
          if (checkMute != null) {
            if (checkMute.isMute)
              EventData[i].isMute = true
            else
              EventData[i].isMute = false
          } else
            EventData[i].isMute = false
        }
      }

      let checkTeam = await Model.Team.find({
        $or: [{
          userId: ObjectId(data.userId)
        }, {
          teamMembers: ObjectId(data.userId)
        }],
        isDeleted: false
      })
      if (checkTeam.length > 0) {
        for (let i = 0; i < checkTeam.length; i++) {
          let isRead = true;
          let check = await Model.CountMessage.findOne({
            userId: ObjectId(data.userId),
            teamId: checkTeam[i]._id,
            count: {
              $ne: 0
            }
          });
          if (check != null) {
            isRead = false
          }
          let criteria = {
            roomId: checkTeam[i].chatId
          }
          let checkChatDate = await Model.UserDeleteChat.findOne({
            userId: ObjectId(data.userId),
            roomId: checkTeam[i].chatId,
            chatDate: {
              $ne: null
            }
          })
          if (checkChatDate != null) {
            criteria.createdAt = {
              $gte: new Date(moment(checkChatDate.chatDate))
            }
          }
          let lastMessageData = await Model.chatMessage.find(criteria).sort({
            createdAt: -1
          })
          let obj = {
            name: checkTeam[i].teamName,
            image: "",
            _id: checkTeam[i]._id,
            type: 2,
            roomId: checkTeam[i].chatId,
            teamId: checkTeam[i]._id,
            lastMessag: {},
            lastMessageTime: ""
          }
          if (lastMessageData.length > 0) {
            if(lastMessageData[0].message == null)
            lastMessageData[0].message = `📷  Media`
            obj = {
              name: checkTeam[i].teamName,
              image: "",
              _id: checkTeam[i]._id,
              type: 2,
              roomId: checkTeam[i].chatId,
              teamId: checkTeam[i]._id,
              lastMessag: lastMessageData[0],
              lastMessageTime: lastMessageData[0].createdAt
            }
          }
          obj.isRead = isRead
          TeamData.push(obj);
        }
        if (search != "" && search != null) {
          let finalSearchData = [];
          for (let i = 0; i < TeamData.length; i++) {
            finalSearchData.push({
              teamName: TeamData[i].name,
              _id: TeamData[i]._id
            })
          }
          let dataService = _.filter(finalSearchData, (itm) => {
            const val2Str = Object.values(flatten(itm)).join("");
            return _.includes(val2Str.toLowerCase(), search.toLowerCase());
          });
          if (dataService.length == 0) {
            TeamData = [];
          }
          let result1 = []
          for (let j = 0; j < dataService.length; j++) {
            let serviceData = await Model.Team.findOne(dataService[j])
            if (serviceData != null) {
              result1.push(serviceData)
            }
          }
          let jsonObject = result1.map(JSON.stringify);
          let uniqueSet = new Set(jsonObject);
          let resultData = Array.from(uniqueSet).map(JSON.parse);
          TeamData = resultData;
          let TeamDataa = []
          for (let i = 0; i < TeamData.length; i++) {
            let lastMessageData = await Model.chatMessage.find({
              roomId: TeamData[i].chatId
            }).sort({
              createdAt: -1
            })
            if (lastMessageData.length > 0) {
              let obj = {
                name: TeamData[i].teamName,
                // image: "",
                _id: TeamData[i]._id,
                roomId: TeamData[i].chatId,
                type: 2,
                teamId: TeamData[i]._id,
                lastMessag: lastMessageData[0],
                lastMessageTime: lastMessageData[0].createdAt
              }
              TeamDataa.push(obj);
            } else {
              let obj = {
                name: TeamData[i].teamName,
                // image: "",
                _id: TeamData[i]._id,
                roomId: TeamData[i].chatId,
                type: 2,
                teamId: TeamData[i]._id,
                lastMessag: {},
                lastMessageTime: ""
              }
              TeamDataa.push(obj);
            }
          }
          TeamData = TeamDataa

        }
        for (let i = 0; i < TeamData.length; i++) {
          let checkMute = await Model.AddMute.findOne({
            chatId: TeamData[i].roomId,
            isDeleted: false
          });
          if (checkMute != null) {
            if (checkMute.isMute)
              TeamData[i].isMute = true
            else
              TeamData[i].isMute = false
          } else
            TeamData[i].isMute = false
        }
      }

      let checkGroup = await Model.Group.find({
        $or: [{
          userId: ObjectId(data.userId)
        }, {
          join: ObjectId(data.userId)
        }],
        isDeleted: false
      })
      if (checkGroup.length > 0) {
        for (let i = 0; i < checkGroup.length; i++) {
          let isRead = true;
          let check = await Model.CountMessage.findOne({
            userId: ObjectId(data.userId),
            groupId: checkGroup[i]._id,
            count: {
              $ne: 0
            }
          });
          if (check != null) {
            isRead = false
          }
          let criteria = {
            roomId: checkGroup[i].chatId
          }
          let checkChatDate = await Model.UserDeleteChat.findOne({
            userId: ObjectId(data.userId),
            roomId: checkGroup[i].chatId,
            chatDate: {
              $ne: null
            }
          })
          if (checkChatDate != null) {
            criteria.createdAt = {
              $gte: new Date(moment(checkChatDate.chatDate))
            }
          }
          let lastMessageData = await Model.chatMessage.find(criteria).sort({
            createdAt: -1
          })
          if (lastMessageData.length > 0) {
            if(lastMessageData[0].message == null)
            lastMessageData[0].message = `📷  Media`
            let obj = {
              name: checkGroup[i].name,
              image: checkGroup[i].image,
              _id: checkGroup[i]._id,
              roomId: checkGroup[i].chatId,
              type: 3,
              groupId: checkGroup[i]._id,
              lastMessag: lastMessageData[0],
              lastMessageTime: lastMessageData[0].createdAt
            }
            obj.isRead = isRead
            groupData.push(obj);
          }
        }
        if (search != "" && search != null) {
          let finalSearchData = [];
          for (let i = 0; i < groupData.length; i++) {
            finalSearchData.push({
              name: groupData[i].name,
              _id: groupData[i]._id
            })
          }
          let dataService = _.filter(finalSearchData, (itm) => {
            const val2Str = Object.values(flatten(itm)).join("");
            return _.includes(val2Str.toLowerCase(), search.toLowerCase());
          });
          if (dataService.length == 0) {
            groupData = [];
          }
          let result1 = []
          for (let j = 0; j < dataService.length; j++) {
            let serviceData = await Model.Group.findOne(dataService[j])
            if (serviceData != null) {
              result1.push(serviceData)
            }
          }
          let jsonObject = result1.map(JSON.stringify);
          let uniqueSet = new Set(jsonObject);
          let resultData = Array.from(uniqueSet).map(JSON.parse);
          groupData = resultData;
          let groupDataa = []
          for (let i = 0; i < groupData.length; i++) {
            let lastMessageData = await Model.chatMessage.find({
              roomId: groupData[i].chatId
            }).sort({
              createdAt: -1
            })
            if (lastMessageData.length > 0) {
              let obj = {
                name: groupData[i].name,
                image: groupData[i].image,
                _id: groupData[i]._id,
                roomId: groupData[i].chatId,
                type: 3,
                groupId: groupData[i]._id,
                lastMessag: lastMessageData[0],
                lastMessageTime: lastMessageData[0].createdAt
              }
              groupDataa.push(obj);
            }
          }
          groupData = groupDataa
        }
        for (let i = 0; i < groupData.length; i++) {
          let checkMute = await Model.AddMute.findOne({
            chatId: groupData[i].roomId,
            isDeleted: false
          });
          if (checkMute != null) {
            if (checkMute.isMute)
              groupData[i].isMute = true
            else
              groupData[i].isMute = false
          } else
            groupData[i].isMute = false
        }
      }

      let checkUserListUser = await Model.chatMessage.distinct("receiverId", {
        senderId: ObjectId(data.userId),
        isDeleted: false
      })
      let checkUserListUserSender = await Model.chatMessage.distinct("senderId", {
        receiverId: ObjectId(data.userId),
        isDeleted: false
      })
      checkUserListUser = checkUserListUser.concat(checkUserListUserSender)
      let jsonObject = checkUserListUser.map(JSON.stringify);
      let uniqueSet = new Set(jsonObject);
      checkUserListUser = Array.from(uniqueSet).map(JSON.parse);
      if (checkUserListUser.length > 0) {
        for (let i = 0; i < checkUserListUser.length; i++) {
          let isRead = true;
          console.log(checkUserListUser[i], typeof(checkUserListUser[i]),"checkUserListUser")
          let check = await Model.CountMessage.findOne({
            userId: ObjectId(data.userId),
            receiverId: ObjectId(checkUserListUser[i]),
            count: {
              $ne: 0
            }
          });
          console.log(check,"check")
          if (check != null) {
            isRead = false
          }
          let criteria = {
            $or: [{
              receiverId: ObjectId(checkUserListUser[i]),
              senderId: ObjectId(data.userId)
            }, {
              receiverId: ObjectId(data.userId),
              senderId: ObjectId(checkUserListUser[i])
            }],
            isDeleted: false
          }
          let checkChatDate = await Model.UserDeleteChat.findOne({
            userId: ObjectId(data.userId),
            senderId: ObjectId(checkUserListUser[i]),
            chatDate: {
              $ne: null
            }
          })
          if (checkChatDate != null) {
            criteria.createdAt = {
              $gte: new Date(moment(checkChatDate.chatDate))
            }
          }
          let checkUserList = await Model.chatMessage.findOne(criteria).populate("receiverId", "userName image")
            .populate("senderId", "userName image")
          let lastMessageData = await Model.chatMessage.find(criteria).sort({
            createdAt: -1
          })
          if (lastMessageData.length > 0 && JSON.stringify(checkUserList.receiverId._id) != JSON.stringify(data.userId) && JSON.stringify(checkUserList.senderId._id) === JSON.stringify(data.userId)) {
            if(lastMessageData[0].message == null)
            lastMessageData[0].message = `📷  Media`
            let obj = {
              name: checkUserList.receiverId.userName,
              image: checkUserList.receiverId.image,
              _id: checkUserList._id,
              type: 1,
              receiverId: checkUserList.receiverId._id,
              lastMessag: lastMessageData[0],
              lastMessageTime: lastMessageData[0].createdAt
            }
            obj.isRead = isRead
            userListData.push(obj);
          } else if (lastMessageData.length > 0 && JSON.stringify(checkUserList.senderId._id) != JSON.stringify(data.userId) && JSON.stringify(checkUserList.receiverId._id) === JSON.stringify(data.userId)) {
            if(lastMessageData[0].message == null)
            lastMessageData[0].message = `📷  Media`
            let obj = {
              name: checkUserList.senderId.userName,
              image: checkUserList.senderId.image,
              _id: checkUserList._id,
              type: 1,
              receiverId: checkUserList.senderId._id,
              lastMessag: lastMessageData[0],
              lastMessageTime: lastMessageData[0].createdAt
            }
            obj.isRead = isRead
            userListData.push(obj);
          }
        }
        if (search != "" && search != null) {
          let finalSearchData = [];
          for (let i = 0; i < userListData.length; i++) {
            finalSearchData.push({
              name: userListData[i].name,
              _id: userListData[i]._id
            })
          }
          let dataService = _.filter(finalSearchData, (itm) => {
            const val2Str = Object.values(flatten(itm)).join("");
            return _.includes(val2Str.toLowerCase(), search.toLowerCase());
          });
          if (dataService.length == 0) {
            userListData = [];
          }
          let result1 = []
          for (let j = 0; j < dataService.length; j++) {
            let serviceData = await Model.chatMessage.findOne(dataService[j])
            if (serviceData != null) {
              result1.push(serviceData)
            }
          }
          let jsonObject = result1.map(JSON.stringify);
          let uniqueSet = new Set(jsonObject);
          let resultData = Array.from(uniqueSet).map(JSON.parse);
          userListData = resultData;
          let groupDataa = []
          for (let i = 0; i < userListData.length; i++) {
            let lastMessageData = await Model.chatMessage.find({
              senderId: ObjectId(data.userId),
              isDeleted: false
            }).sort({
              createdAt: -1
            })
            if (lastMessageData.length > 0) {
              let obj = {
                name: userListData[i].userName,
                image: userListData[i].image,
                _id: userListData[i]._id,
                type: 1,
                receiverId: userListData[i].receiverId,
                lastMessag: lastMessageData[0],
                lastMessageTime: lastMessageData[0].createdAt
              }
              groupDataa.push(obj);
            }
          }
          userListData = groupDataa
        }
        for (let i = 0; i < userListData.length; i++) {
          console.log(userListData[i].receiverId,"userListData[i].receiverId");
          let checkMute = await Model.AddMute.findOne({
            userId: ObjectId(data.userId),
            receiverId: userListData[i].receiverId,
            isDeleted: false
          });
          console.log(checkMute,"checkMutecheckMute")
          if (checkMute != null) {
            if (checkMute.isMute)
              userListData[i].isMute = true
            else
              userListData[i].isMute = false
          } else
            userListData[i].isMute = false
        }
      }

      let dataToSend = []
      if (data.type == 1) {
        dataToSend = dataToSend.concat(EventData)
        dataToSend = dataToSend.concat(TeamData)
        dataToSend = dataToSend.concat(groupData)
        dataToSend = dataToSend.concat(userListData)
      } else if (data.type == 2) {
        dataToSend = EventData
      }
      dataToSend.sort((a, b) => {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });
      io.to(data.userId).emit("USER_LIST_DATA", {
        dataToSend
      });
    } catch (error) {
      console.error(error || error.message)
      io.to(data.userId).emit('falseListner', {
        sucess: 400,
        error: error.message
      });
    }
  });
  socket.on("joinRoom", async function (data) {
    try {
      console.log("joinRoomdata")
      if (data && data.roomId != "" && data.roomId != null) {
        socket.join(data.roomId);
        await Model.User.findOneAndUpdate({
          _id: ObjectId(data.userId)
        }, {
          $set: {
            joinedRoom: data.roomId
          }
        }, {
          new: true
        })
        await Model.CountMessage.findOneAndUpdate({
          userId: ObjectId(data.userId),
          chatId: data.roomId
        }, {
          $set: {
            count: 0
          }
        }, {
          new: true
        })
        io.to(socket.id).emit("join_user", {
          success: true
        });
      } else if (data && data.receiverId != "" && data.receiverId != null && data.userId != "" && data.userId != null) {
        socket.join(`${data.receiverId}${data.userId}`);
        socket.join(`${data.userId}${data.receiverId}`);
        await Model.User.findOneAndUpdate({
          _id: ObjectId(data.userId)
        }, {
          $set: {
            joinedUser: ObjectId(data.receiverId)
          }
        }, {
          new: true
        })

        await Model.CountMessage.findOneAndUpdate({
          userId: ObjectId(data.userId),
          receiverId: ObjectId(data.receiverId)
        }, {
          $set: {
            count: 0
          }
        }, {
          new: true
        })
        io.to(socket.id).emit("join_user", {
          success: true
        });
      }
    } catch (error) {
      console.error(error || error.message)
      io.to(data.userId).emit('falseListner', {
        sucess: 400,
        error: error.message
      });
    }
  });
  socket.on("leaveRoom", async function (data) {
    try {
      console.log("leaveRoomdata")
      if (data && data.roomId != "" && data.roomId != null) {
        socket.leave(data.roomId);
        await Model.User.findOneAndUpdate({
          _id: ObjectId(data.userId)
        }, {
          $set: {
            joinedRoom: null
          }
        }, {
          new: true
        })
        io.to(data.socket.id).emit("leave_user", {
          isOnline: false
        });
      } else if (data && data.receiverId != "" && data.receiverId != null && data.userId != "" && data.userId != null) {
        socket.leave(`${data.receiverId}${data.userId}`);
        socket.leave(`${data.userId}${data.receiverId}`);
        await Model.User.findOneAndUpdate({
          _id: ObjectId(data.userId)
        }, {
          $set: {
            joinedUser: null
          }
        }, {
          new: true
        })
        io.to(data.socket.id).emit("leave_user", {
          isOnline: false
        });
      }
    } catch (error) {
      console.error(error || error.message)
      io.to(data.userId).emit('falseListner', {
        sucess: 400,
        error: error.message
      });
    }
  });
  socket.on('typing_user', async (data) => {
    try{
      let isTyping = true;
      io.to(data.receiverId).emit("isTyping", {
      isTyping
      });
      if (data.roomId) {
      io.to(data.roomId).emit("isTyping", {
        isTyping
      });
      }
    } catch (error) {
      console.error(error || error.message)
      io.to(data.userId).emit('falseListner', {
        sucess: 400,
        error: error.message
      });
    }
  });
  socket.on('onlineCheck', async (data) => {
    try{
      console.log("onlineCheck")
      let isOnline = false;
      if (isValidObjectId(data.receiverId)) {
      let result = await Model.User.findOne({
        _id: data.receiverId
      })
      if (result.isActive) {
        isOnline = true;
      }
      }
      io.to(data.userId).emit("isOnlineCheck", {
      isOnline
      });
    } catch (error) {
      console.error(error || error.message)
      io.to(data.userId).emit('falseListner', {
        sucess: 400,
        error: error.message
      });
    }

  });
  socket.on('send_message_user', async (data) => {
    try {
      console.log("send_message_user");
      if (data && (data.roomId != "" || data.receiverId != "")) {
        let messageData = {};
        if (data.teamId == "" || data.teamId == null) {
          delete data.teamId
        }
        if (data.receiverId == "" || data.receiverId == null) {
          delete data.receiverId
        }
        if (data.groupId == "" || data.groupId == null) {
          delete data.groupId
        }
        if (data.eventId == "" || data.eventId == null) {
          delete data.eventId
        }
        if (data.receiverId != "" && data.receiverId != null) {
          let userData = await Model.User.findOne({
            _id: ObjectId(data.receiverId)
          })
          if (userData != null) {
            let checkUser = await Model.AccountSync.findOne({
              userId: data.senderId,
              ActiveUsers: ObjectId(data.receiverId)
            })
            if (checkUser == null) {
              let check = await Model.chatMessage.findOne({
                $or: [{
                  receiverId: ObjectId(data.receiverId)
                }, {
                  senderId: ObjectId(data.senderId)
                }],
                $or: [{
                  senderId: ObjectId(data.senderId)
                }, {
                  receiverId: ObjectId(data.receiverId)
                }],
                $or: [{
                  isAccept: true
                }, {
                  isReject: true
                }]
              })
              if (check != null && check.isReject) {
                io.to(data.senderId).emit('failure', {
                  sucess: 208,
                  message: 'Unable to send new message',
                  data: {}
                });
              } else if (check != null && check.isAccept) {
                messageData = await Model.chatMessage(data).save();
              } else {
                let count = await Model.chatMessage.countDocuments({
                  receiverId: ObjectId(data.receiverId),
                  senderId: ObjectId(data.senderId)
                })
                if (count < 10) {
                  messageData = await Model.chatMessage(data).save();
                } else {
                  io.to(data.senderId).emit('failure', {
                    sucess: 208,
                    message: 'Unable to send new message',
                    data: {}
                  })
                }
              }
            } else {
              messageData = await Model.chatMessage(data).save();
            }
          }
        } else {
          messageData = await Model.chatMessage(data).save();
        }
        if (messageData != null) {
          messageData = await Model.chatMessage.findOne({
            _id: messageData._id
          }).populate('senderId', 'userName image')
          let obj = {
            "msgType": messageData.msgType,
            "fileUrl": messageData.fileUrl,
            "isUserNotification": messageData.isUserNotification,
            "isRead": messageData.isRead,
            "isDeleted": messageData.isDeleted,
            "_id": messageData._id,
            "senderId": messageData.senderId,
            "message": messageData.message,
            "eventId": messageData.eventId,
            "roomId": messageData.roomId,
            "msgFor": messageData.msgFor,
            "createdAt": messageData.createdAt,
            "updatedAt": messageData.updatedAt,
            "sentType": messageData.sentType
          }
          if (data.roomId != null && data.roomId != "") {
            io.to(data.roomId).emit("receive_message", obj);
          } else {
            io.to(`${data.receiverId}${data.senderId}`).emit("receive_message", obj);
          }
        }
        if (data.teamId) {
          let teamData = await Model.Team.findOne({
            _id: ObjectId(data.teamId)
          }).populate("teamMembers", "firstName userName joinedRoom isChatNotification")
          if (teamData != null) {
            for (let i = 0; i < teamData.teamMembers.length; i++) {
              if (teamData.teamMembers[i].joinedRoom != data.roomId) {
                let check = await Model.CountMessage.findOne({
                  teamId: ObjectId(data.teamId),
                  userId: teamData.teamMembers[i]
                })
                if (check != null) {
                  await Model.CountMessage.updateOne({
                    teamId: ObjectId(data.teamId),
                    userId: teamData.teamMembers[i],
                    chatId: data.roomId
                  }, {
                    $inc: {
                      count: 1
                    }
                  })
                } else {
                  await Model.CountMessage({
                    teamId: data.teamId,
                    count: 1,
                    chatId: data.roomId,
                    userId: teamData.teamMembers[i]
                  }).save()
                }
              }
              if (teamData.teamMembers[i].joinedRoom != data.roomId && teamData.teamMembers[i].isChatNotification == true && JSON.stringify(teamData.teamMembers[i]._id) != JSON.stringify(data.senderId)) {
                const checkMute = await Model.AddMute.findOne({
                  userId : teamData.teamMembers[i]._id,
                  chatId : data.roomId
              })
              if (checkMute == null || checkMute.isMute == false) {
                let payload = {
                  teamId: teamData._id,
                  senderId: data.senderId,
                  userId: teamData.teamMembers[i]._id,
                  title: "",
                  values: teamData,
                  notificationType: 2,
                  isUserNotification: true,
                  isNotificationSave: true,
                  pushType: constants.PUSH_TYPE_KEYS.NEW_MESSAGE_IN_TEAM,
                  eventType: 14
                }
                process.emit("sendNotificationToUser", payload);
              }
              }
            }
          }
        }
        if (data.receiverId) {
          let userData = await Model.User.findOne({
            _id: ObjectId(data.receiverId)
          })
          let checkUserOnline = await Model.User.findOne({
            _id: ObjectId(data.receiverId),
            joinedUser: ObjectId(data.senderId)
          })
          if (checkUserOnline == null) {
            let check = await Model.CountMessage.findOne({
              receiverId: ObjectId(data.senderId),
              userId: ObjectId(data.receiverId)
            }).populate("receiverId", "userName")
            if (check != null) {
              await Model.CountMessage.updateOne({
                receiverId: ObjectId(data.senderId),
                userId: ObjectId(data.receiverId)
              }, {
                $inc: {
                  count: 1
                }
              })
            } else {
              await Model.CountMessage({
                receiverId: data.senderId,
                count: 1,
                userId: data.receiverId
              }).save()
            }
            if (userData.isChatNotification == true) {
              const checkMute = await Model.AddMute.findOne({
                userId : ObjectId(data.receiverId),
                receiverId : ObjectId(data.senderId)
            })
            if (checkMute == null || checkMute.isMute == false) {
              console.log(checkMute,"checkMute");
              let payload = {
                receiverId: userData._id,
                senderId: data.senderId,
                userId: userData._id,
                title: "",
                values: check,
                notificationType: 2,
                isUserNotification: true,
                isNotificationSave: true,
                pushType: constants.PUSH_TYPE_KEYS.SEND_MESSAGE_TO_SINGLE_USER,
                eventType: 13
              }
              process.emit("sendNotificationToUser", payload);
            }

            }
          }
        }
        if (data.groupId) {
          let groupData = await Model.Group.findOne({
            _id: ObjectId(data.groupId)
          }).populate("join", "firstName userName joinedRoom isChatNotification")
          if (groupData != null) {
            for (let i = 0; i < groupData.join.length; i++) {
              if (groupData.join[i].joinedRoom != data.roomId) {
                let check = await Model.CountMessage.findOne({
                  groupId: ObjectId(data.groupId),
                  userId: groupData.join[i]
                })
                if (check != null) {
                  await Model.CountMessage.updateOne({
                    groupId: ObjectId(data.groupId),
                    userId: groupData.join[i],
                    chatId: data.roomId
                  }, {
                    $inc: {
                      count: 1
                    }
                  })
                } else {
                  await Model.CountMessage({
                    groupId: data.groupId,
                    count: 1,
                    chatId: data.roomId,
                    userId: groupData.join[i]
                  }).save()
                }
              }
              if (groupData.join[i].joinedRoom != data.roomId && groupData.join[i].isChatNotification == true && JSON.stringify(groupData.join[i]._id) != JSON.stringify(data.senderId)) {
                const checkMute = await Model.AddMute.findOne({
                  userId : groupData.join[i]._id,
                  chatId : data.roomId
              })
              if (checkMute == null || checkMute.isMute == false) {
                let payload = {
                  groupId: groupData._id,
                  senderId: data.senderId,
                  userId: groupData.join[i]._id,
                  title: "",
                  values: groupData,
                  notificationType: 2,
                  isUserNotification: true,
                  isNotificationSave: true,
                  pushType: constants.PUSH_TYPE_KEYS.NEW_MESSAGE_IN_GROUP,
                  eventType: 15
                }
                process.emit("sendNotificationToUser", payload);
              }
              }
            }
          }
        }
        if (data.eventId) {
          let eventData = await Model.Event.findOne({
            _id: ObjectId(data.eventId)
          }).populate("acceptedList", "firstName userName joinedRoom isChatNotification")
          if (eventData != null) {
            for (let i = 0; i < eventData.acceptedList.length; i++) {
              if (eventData.acceptedList[i].joinedRoom != data.roomId) {
                let check = await Model.CountMessage.findOne({
                  eventId: ObjectId(data.eventId),
                  userId: eventData.acceptedList[i]
                })
                if (check != null) {
                  await Model.CountMessage.updateOne({
                    eventId: ObjectId(data.eventId),
                    userId: eventData.acceptedList[i],
                    chatId: data.roomId
                  }, {
                    $inc: {
                      count: 1
                    }
                  })
                } else {
                  await Model.CountMessage({
                    eventId: data.eventId,
                    count: 1,
                    chatId: data.roomId,
                    userId: eventData.acceptedList[i]
                  }).save()
                }
              }
              if (eventData.acceptedList[i].joinedRoom != data.roomId && eventData.acceptedList[i].isChatNotification == true && JSON.stringify(eventData.acceptedList[i]._id) != JSON.stringify(data.senderId)) {
                const checkMute = await Model.AddMute.findOne({
                  userId : eventData.acceptedList[i]._id,
                  chatId : data.roomId
              })
              console.log(data,"1111111111111");
              if (checkMute == null || checkMute.isMute == false) {
                let payload = {
                  eventId: eventData._id,
                  senderId: data.senderId,
                  userId: eventData.acceptedList[i]._id,
                  title: "",
                  values: eventData,
                  notificationType: 2,
                  isUserNotification: true,
                  isNotificationSave: true,
                  pushType: constants.PUSH_TYPE_KEYS.NEW_MESSAGE_IN_EVENT,
                  eventType: 16
                }
                process.emit("sendNotificationToUser", payload);
              }
              }
            }
          }
        }

      }
    } catch (error) {
      console.error(error || error.message)
      io.to(data.userId).emit('falseListner', {
        sucess: 400,
        error: error.message
      });
    }
  });
}