const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const constants = require('../common/constants')

const DocSchema = new Schema({
    email: {
        type: String,
        default: "",
        index: true
    },
    phoneNo: {
        type: String,
        default: ""
    },
    role: {
        type: Number,
        enum: [constants.ROLE.ADMIN, constants.ROLE.SUBADMIN],
        default: constants.ROLE.SUBADMIN
    },
    dialCode: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: "",
        index: true
    },
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    image: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: "",
        enum: ["", "MALE", "FEMALE", "OTHER"]
    },
    country: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    location: {
        type: {
          type: String,
          default: "Point"
        },
        coordinates: {
          type: [Number],
          default: [0, 0]
        },
    },
    birthDate: {
        type: Date,
        default: 0
    },
    profileStatus: {
      type: Number,
      enum:[constants.PROFILE_STATUS.PENDING, constants.PROFILE_STATUS.PERSONAL_DETAILS, constants.PROFILE_STATUS.UPDATED],
      default : constants.PROFILE_STATUS.PENDING
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    loginCount: {
        type: Number,
        default: 0
    },
    accessToken: {
        type: String,
        default: "",
        index: true
    },
    deviceToken: {
        type: String,
        default: "",
        index: true
    },
    deviceType: {
        type: String,
        default: "",
        enum: ["", "WEB", "IOS", "ANDROID"]
    },
    permission: [{
        label: {
            type: String,
            default: null
        },
        isView: {
            type: Boolean,
            default: false
        },
        isAdd: {
            type: Boolean,
            default: false
        },
        isEdit: {
            type: Boolean,
            default: false
        },
        isDelete: {
            type: Boolean,
            default: false
        }
    }],
}, {
    timestamps: true
});

DocSchema.index({
    dialCode: 1,
    phoneNo: 1
});
DocSchema.set("toJSON", {
    getters: true,
    virtuals: true
});

DocSchema.virtual("fullName")
    .get(function () {
        return this.firstName + " " + this.lastName;
    })
    .set(function (val) {
        this.firstName = val.substr(0, val.indexOf(" "));
        this.lastName = val.substr(val.indexOf(" ") + 1);
    });

DocSchema.methods.authenticate = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
        if (!password) {
            reject(new Error("MISSING_PASSWORD"));
        }

        bcrypt.compare(password, this.password, (error, result) => {
            if (!result) reject(new Error("INVALID_PASSWORD"));
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};

DocSchema.methods.setPassword = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
        if (!password) reject(new Error("Missing Password"));

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject(err);
            this.password = hash;
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};

module.exports = mongoose.model("Admins", DocSchema);