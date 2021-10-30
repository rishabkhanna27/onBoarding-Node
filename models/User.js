const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const constants = require('../common/constants')
const ObjectId = mongoose.Types.ObjectId;
var userSchema = new Schema({
  firstName: {
    type: String,
    default: ""
  },
  lastName: {
    type: String,
    default: ""
  },
  userName: {
    type: String,
    default: ""
  },
  phoneNo: {
    type: String,
    default: ""
  },
  dialCode: {
    type: String,
    default: ""
  },
  profileStatus: {
    type: Number,
    enum:[constants.PROFILE_STATUS.PENDING, constants.PROFILE_STATUS.PERSONAL_DETAILS, constants.PROFILE_STATUS.UPDATED],
    default : constants.PROFILE_STATUS.PENDING
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
    default: "OTHER",
  },
  image: {
    type: String,
    default: ""
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
    type: String,
    default: 0
  },
  longitude: {
    type: String,
    default: 0
  },
  isNotification: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
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
    enum: ["WEB", "ANDROID", "IOS"]
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
  loginCount: {
    type: Number,
    default: 0
  },
  socketId : {
    type: String,
    default : ""
  },
  joinedRoom : {
    type : String
  },
  tokenExpire: {
    type: String
  },
  otp: {
    type: String,
    default: ""
  },
  otpExpire: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
})
userSchema.index({
  location: '2dsphere'
});


userSchema.methods.authenticate = function (password, callback) {
  const promise = new Promise((resolve, reject) => {
    if (!password) reject(new Error("MISSING_PASSWORD"));

    bcrypt.compare(password, this.password, (error, result) => {
      if (!result) {
          reject(new Error("Invalid Password"));
      }
      resolve(this);
    });
  });

  if (typeof callback !== "function") return promise;
  promise
    .then((result) => callback(null, result))
    .catch((err) => callback(err));
};

userSchema.methods.setPassword = function (password, callback) {
  console.log("inin");
  const promise = new Promise((resolve, reject) => {
    if (!password) reject(new Error("Missing Password"));

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      this.password = hash;
      resolve(this);
    });
  });

  if (typeof callback !== "function") return promise;
  promise
    .then((result) => callback(null, result))
    .catch((err) => callback(err));
};


module.exports = mongoose.model('User', userSchema);