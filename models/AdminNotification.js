const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const AdminNotificationModel = new Schema({
    eventId: {
        type: ObjectId,
        ref: 'event',
        default: null
    },
    groupId: {
        type: ObjectId,
        ref: 'group',
        default: null
    },
    userId: {
        type: ObjectId,
        ref: 'user'
    },
    adminId: {
        type: ObjectId,
        ref: 'Admin',
        default: null
    },
    receiverId: {
        type: ObjectId,
        ref: 'user'
    },
    isNotificationSave: {
        type: Boolean,
        default: false
    },
    isUserNotification: {
        type: Boolean,
        default: false 
    },
    pushType: {
        type: Number
    },
    eventType: {
        type: String
    },
    message: {
        type: String
    },
    title: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
const AdminNotification = mongoose.model('AdminNotification', AdminNotificationModel);
module.exports = AdminNotification;