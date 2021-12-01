const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PermissionModel = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'admin'
    },
    permission: [{
        label: {type: String, default: null},
        isView: {type: Boolean, default: false}, 
        isAdd: {type: Boolean, default: false},
        isEdit: {type: Boolean, default: false},
        isDelete: {type: Boolean, default: false}
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const Role = mongoose.model('permission', PermissionModel);
module.exports = Role;