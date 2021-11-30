const _ = require("lodash");
const Model = require("../../models/index");
const moment = require("moment");
const Validation = require("../validations");
const Auth = require("../../common/authenticate");
const mongoose = require("mongoose");
const constants = require("../../common/constants");
const flatten = require("flat");
const ObjectId = mongoose.Types.ObjectId;
const es = require("event-stream");
const fs = require("fs");
const mailService = require('../../services/EmalService')

// ONBOARDING API'S

module.exports.login = async (req, res, next) => {
  try {
    await Validation.Admin.login.validateAsync(req.body);
    const doc = await Model.Admin.findOne({
      email: req.body.email,
      isDeleted: false,
    });
    if (!doc) {
      throw new Error(constants.MESSAGES.INVALID_CREDENTIALS);
    }
    await doc.authenticate(req.body.password);
    if (doc.isBlocked) {
      throw new Error(constants.constant.ACCOUNT_BLOCKED);
    }
    doc.loginCount += 1;
    doc.accessToken = await Auth.getToken({
      _id: doc._id
    });
    doc.deviceToken = req.body.deviceToken;
    doc.deviceType = req.body.deviceType;
    await doc.save();
    return res.success(constants.MESSAGES.LOGIN_SUCCESS, doc);
  } catch (error) {
    next(error);
  }
};
module.exports.logout = async (req, res, next) => {
  try {
    await Model.Admin.updateOne({
      _id: req.admin._id
    }, {
      accessToken: ""
    });
    return res.success(constants.MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
};
module.exports.getProfile = async (req, res, next) => {
  try {
    const doc = await Model.Admin.findOne({
      _id: req.admin._id
    });
    if(!doc) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND)
    if(doc.isBlocked) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED)
    return res.success(constants.MESSAGES.DATA_FETCHED, doc);
  } catch (error) {
    next(error);
  }
};
module.exports.updateProfile = async (req, res, next) => {
  try {
    await Validation.Admin.updateProfile.validateAsync(req.body);
    const timeZone = req.body.timeZone || 330
    const nin = {
      $nin: [req.admin._id]
    };
    if (req.body.email) {
      const checkEmail = await Model.Admin.findOne({
        _id: nin,
        email: req.body.email,
        isDeleted: false,
      });
      if (checkEmail) throw new Error(constants.MESSAGES.EMAIL_ALREADY_IN_USE);
    }
    if (req.body.phoneNo) {
      const checkPhone = await Model.Admin.findOne({
        _id: nin,
        dialCode: req.body.dialCode,
        phoneNo: req.body.phoneNo,
        isDeleted: false,
      });
      if (checkPhone) throw new Error(constants.MESSAGES.PHONE_ALREADY_IN_USE);
    }
    const email = req.body.email;
    req.body.isProfileSetup = true;
    const updated = await Model.Admin.findOneAndUpdate({
      _id: req.admin._id
    }, {
      $set: req.body
    }, {
      new: true
    });
    if (req.body.email) {
      let dataToSend = {
          adminId : req.admin._id,
          email : req.body.email,
          timeZone : timeZone
      }
      await mailService.sendEmailVerification(dataToSend)
    }    
    return res.success(constants.constant.PROFILE_UPDATED_SUCCESSFULLY, updated);
  } catch (error) {
    next(error);
  }
};
module.exports.changePassword = async (req, res, next) => {
  try {
    await Validation.Admin.changePassword.validateAsync(req.body);

    if (req.body.oldPassword === req.body.newPassword)
      throw new Error(constants.MESSAGES.PASSWORDS_SHOULD_BE_DIFFERENT);

    const doc = await Model.Admin.findOne({
      _id: req.admin._id
    });
    if (!doc) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND);

    await doc.authenticate(req.body.oldPassword);
    await doc.setPassword(req.body.newPassword);
    await doc.save();

    return res.success(constants.MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY);
  } catch (error) {
    next(error);
  }
};
module.exports.sendNewPasswordInEmail = async (req, res, next) => {
  try {
    await Validation.Admin.sendOTP.validateAsync(req.body);
    let doc = null;
    if (req.body.email) {
      doc = await Model.Admin.findOne({
        email: req.body.email,
        isDeleted: false,
      });
      if(!doc) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND)
      if(doc.isBlocked) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED)
      let dataToSend = {
        email : req.body.email
    }
    await mailService.adminForgetPassword(dataToSend)
    }

    return res.success("New Password Sent");
  } catch (error) {
    next(error);
  }
};
module.exports.verifyOtp = async (req, res, next) => {
    try {
      await Validation.Admin.verifyOTP.validateAsync(req.body);
      let timeZone = req.body.timeZone || 330
      let doc = null;
      if (req.body.email) {
        doc = await Model.Admin.findOne({
            email: req.body.email,
            isDeleted: false,
        });
      } else if (req.body.phoneNo) {
        doc = await Model.Admin.findOne({
            dialCode: req.body.dialCode,
            phoneNo: req.body.phoneNo,
            isDeleted: false,
        });
      }
      if (!doc) throw new Error(constants.MESSAGES.ACCOUNT_NOT_FOUND);
      if (doc.isBlocked) throw new Error(constants.MESSAGES.ACCOUNT_BLOCKED);
      doc = await Model.Admin.findOne({
        _id : doc._id,
        otpExpire : {$gte : new Date(moment().add(timeZone, "m"))}
      }).lean()
      if(!doc) throw new Error(constants.MESSAGES.OTP_EXPIRED)
      if(req.body.otp != doc.otp){
          throw new Error(constants.MESSAGES.INVALID_OTP)
      }
      doc.otp = "",
      doc.otpExpire = "",
      doc.accessToken = await Auth.getToken({
        _id: doc._id
      });
      if (req.body.email) {
        doc.isEmailVerified = true;
      }
      if (req.body.phone) {
        doc.isPhoneVerified = true;
      }
      await doc.save();
      return res.success(constants.MESSAGES.ACCOUNT_VERIFIED, doc);
    } catch (error) {
      next(error);
    }
};

// CMS
module.exports.addCms = async (req, res, next) => {
  try {
    let dataObject = {}
    if (req.body.privacyPolicy != null && req.body.privacyPolicy != "") dataObject.privacyPolicy = req.body.privacyPolicy
    if (req.body.termsAndConditions != null && req.body.termsAndConditions != "") dataObject.termsAndConditions = req.body.termsAndConditions
    if (req.body.faq != null && req.body.faq != "") dataObject.faq = req.body.faq

    const addCms = await Model.CmsModel.findOneAndUpdate({}, dataObject, {
      upsert: true,
      new: true
    })
    return res.success(constants.MESSAGES.SUCCESS, addCms);
  } catch (error) {
    next(error);
  }
};
module.exports.getCms = async (req, res, next) => {
  try {
    const cmsData = await Model.CmsModel.findOne({});
    return res.success(constants.MESSAGES.DATA_FETCHED, cmsData);
  } catch (error) {
    next(error);
  }
};

//User
module.exports.getUser = async (req, res, next) => {
  try {
    const limit = req.body.limit || 10
    const page = req.body.page || 0
    let criteria = {
      isDeleted: false
    }
    let user = await Model.User.find(criteria)
      .limit(limit)
      .skip(page * limit)
      .sort({
          createdAt: -1
      }).lean().exec();
    let count = await Model.User.countDocuments(criteria);
    if (search != "" && search != null) {
      let UserList = await Model.User.find({
        isDeleted: false
      }).sort({
          createdAt: -1
      });
      let finalSearchData = [];
      for (let i = 0; i < UserList.length; i++) {
        finalSearchData.push({
          firstName: UserList[i].firstName,
          lastName: UserList[i].lastName,
          _id: UserList[i]._id,
          userName: UserList[i].userName
        })
      }
      let dataService = _.filter(finalSearchData, (itm) => {
        const val2Str = Object.values(flatten(itm)).join("");
        return _.includes(val2Str.toLowerCase(), search.toLowerCase());
      });
      if (dataService.length == 0) {
        user = [];
      }
      let result1 = []
      for (let j = 0; j < dataService.length; j++) {
        let serviceData = await Model.User.findOne(dataService[j])
        if (serviceData != null) {
          result1.push(serviceData)
        }
      }
      let jsonObject = result1.map(JSON.stringify);
      let uniqueSet = new Set(jsonObject);
      let resultData = Array.from(uniqueSet).map(JSON.parse);
      user = resultData;
      count = resultData.length;
    }
    return res.success(constants.MESSAGES.DATA_FETCHED, {
        user,
        count
    });
  } catch (error) {
    next(error);
  }
};
module.exports.getUserById = async (req, res, next) => {
  try {
    let user = await Model.User.findOne({
      _id: ObjectId(userId),
      isDeleted: false
      }, {
        firstName: 1,
        lastName: 1,
        email: 1,
        userName: 1,
        phoneNo: 1,
        dialCode: 1,
        image: 1,
        address: 1
    })
    if (user == null) throw new Error(constants.MESSAGES.USER_DATA_MISSING);
    return res.success(constants.MESSAGES.DATA_FETCHED, user);

  } catch (error) {
    next(error);
  }
};
module.exports.updateUser = async (req, res, next) => {
  try {
    await Validation.Admin.updateUser.validateAsync(req.body);
    const doc = await Model.User.findOneAndUpdate({
      _id: ObjectId(req.body.userId)
    }, {
      $set: req.body
    }, {
      new: true
    });
    return res.success(constants.MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, doc);
  } catch (error) {
    next(error);
  }
};
module.exports.getUerCsv = async (req, res, next) => {
  try {
    let count = -1;
    const user = await Model.User.find({
      isDeleted: false
    }).cursor({})
    const fileName = "User.csv";
    const fileUrl = "public/uploads/admin/" + fileName;
    const writableStream = fs.createWriteStream(fileUrl);
    writableStream.write(
      "S.No, Name, Phone Number, Sign-up date, Status, Email\n"
    );
    user
      .pipe(
        es.map(async (details, callback) => {
          count++;
          return callback(
            null,
            `${
            count
            },${
            JSON.stringify(details.userName ? details.userName : "")
            },${
              JSON.stringify((details.phoneNo ? details.dialCode+'-': details.dialCode)+(details.phoneNo?details.phoneNo: ''))
            },${
              JSON.stringify(details.createdAt ? new Date(moment(details.createdAt).format("DD-MMM-YYYY")) : "")
            },${
            JSON.stringify(details.isBlocked ? details.isBlocked : false)
            },${
            JSON.stringify(details.email ? details.email : "")
            }\n`
          );
        })
      )
      .pipe(writableStream);
    user.on("end", async () => {
        console.log("url", fileUrl);
    });
    let fileNameSend = {
        redirection: config.exportUrl + fileName,
    };
    return res.success(constants.MESSAGES.SUCCESS, fileNameSend);
  } catch (error) {
    next(error);
  }
};