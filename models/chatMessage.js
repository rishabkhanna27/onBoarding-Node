const mongoose = require('mongoose');
const { constant } = require('../common/constants');
const Schema = mongoose.Schema;
const constants = require('../common/constants')
const chatMessageModel = new Schema({
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    msgType : {
        type : String,
        enum : ["Message", "File"],
        default : "Message"
    },
    sentType : {
        type : Number,
        enum : [constants.SENT_TYPE.MESSAGE, constants.SENT_TYPE.IMAGE, constants.SENT_TYPE.VIDEO],
        default : constants.SENT_TYPE.MESSAGE
    },
    fileUrl :{
        type : String,
        default : ""
    },
    roomId : {
        type : String
    },
    msgFor : {
        type : Number,
        enum : [constants.MSG_FOR.USER, constants.MSG_FOR.TEAM, constants.MSG_FOR.GROUP, constants.MSG_FOR.EVENT]
    },
    isAccept: {
        type: Boolean
    },
    isReject: {
        type: Boolean
    },
    isUserNotification: { type: Boolean, default: false },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});
const chatMessage = mongoose.model('chatMessage', chatMessageModel);
module.exports = chatMessage;