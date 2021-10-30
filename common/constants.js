module.exports = {
    MESSAGES: {
        USER_DATA_MISSING : "USER DATA NOT FOUND.",
        EMAIL_MISSING : "EMAIL ID MISSING.",
        PHONE_MISSING : "PHONE NUMBER MISSING.",
        DIAL_CODE_MISSING : "DIAL CODE MISSING.",
        TIME_MISSING : "TIME ZONE IS MISSING.",
        ACCOUNT_CREATED_SUCCESSFULLY : "ACCOUNT CREATED SUCCESSFULLY.",
        EMAIL_ALREADY_IN_USE : "EMAIL ALREADY INN USE.",
        PHONE_ALREADY_IN_USE : "PHONE NO ALREADY INN USE.",
        INVALID_CREDENTIALS : "INVALID CREDENTIALS.",
        ACCOUNT_BLOCKED : "YOUR ACCOUNT HAS BEEN BLOCKED.",
        LOGIN_SUCCESS : "LOGIN SUCCESSFULL.",
        LOGOUT_SUCCESS : "LOGOUT SUCCESSFULL.",
        DATA_FETCHED : "DATA FETCHED SUCCESSFULLY.",
        EMAIL_ALREADY_EXISTS : "EMAIL ALREADY EXISTS.",
        PHONE_ALREADY_EXISTS : "PHONE NO ALREADY EXISTS.",
        UPLOADING_ERROR : "UPLOADING_ERROR.",
        IMAGE_UPLOADED : "IMAGE UPLOADED SUCCESSFULLY.",
        ACCOUNT_DELETED : "ACCOUNT DELETED SUCCESSFULLY.",
        NO_DATA_SUCCESS : "NO DATA SUCCESS.",
        OTP_SENT : "OTP SENT SUCCESSFULLY.",
        OTP_EXPIRED : "OTP EXPIRED.",
        INVALID_OTP : "INVALID OTP.",
        ACCOUNT_VERIFIED : "ACCOUNT VERIFIED SUCCESSFULLY.",
        PROFILE_UPDATED_SUCCESSFULLY : "PROFILE UPDATED SUCCESSFULLY.",
        MESSAGE_TITLE_MISSING : "BROADCAST MESSAGE TITLE MISSING.",
        MESSAGE_BODY_MISSING : "BROADCAST MESSAGE BODY MISSING.",
        ADMIN_NOT_FOUND : "ADMIN ACCOUNT NOT FOUND.",
        ACCOUNT_NOT_FOUND : "ACCOUNT NOT FOUND",
        PASSWORD_CHANGED_SUCCESSFULLY : "PASSWORD CHANGED SUCCESSFULLY.",
        PASSWORDS_SHOULD_BE_DIFFERENT : "NEW PASSWORD SHOULD BE DIFFERENT THAN THE OLD PASSWORD.",
        SUCCESS : "SUCCESS"

    },
    PROFILE_STATUS: {
        PENDING : 1,
        PERSONAL_DETAILS : 2,
        UPDATED : 3
    },

    ROLE: {
        ADMIN: 1,
        SUBADMIN: 2
    },

    SENT_TYPE: {
        MESSAGE: 1,
        IMAGE: 2,
        VIDEO: 3
    },
    PUSH_TYPE: {
        1: {
            keys: [],
            message: {
                en: "{{senderId.userName}} liked your event.",
                ar: "{{senderId.userName}} liked your event."
            },
            title: {
                en: "Liked Post",
                ar: "Liked Post ar"
            }
        },
        2: {
            keys: [],
            message: {
                en: "{{senderId.userName}} disliked your event.",
                ar: "{{senderId.userName}} disliked your event."
            },
            title: {
                en: "Event Disliked ",
                ar: "Event Disliked  ar"
            }
        },
        3: {
            keys: [],
            message: {
                en: "{{userId.userName}} liked your Poll.",
                ar: "{{userId.userName}} liked your Poll."
            },
            title: {
                en: "Poll liked ",
                ar: "Poll liked  ar"
            }
        },
        4: {
            keys: [],
            message: {
                en: "You have successfully entered the event {{eventName}}.",
                ar: "You have successfully entered the event {{eventName}}."
            },
            title: {
                en: "Entered the event ",
                ar: "Entered the event  ar"
            }
        },
        5: {
            keys: [],
            message: {
                en: "{{userId.userName}} Invited you to join {{eventName}} Event.",
                ar: "{{userId.userName}} Invited you to join {{eventName}} Event."
            },
            title: {
                en: "Event Invite ",
                ar: "Event Invite  ar"
            }
        },
        6: {
            keys: [],
            message: {
                en: "{{userId.userName}} Invited you to join {{name}} Group..",
                ar: "{{userId.userName}} Invited you to join {{name}} Group.."
            },
            title: {
                en: "Group Invite ",
                ar: "Group Invite  ar"
            }
        },
        7: {
            keys: [],
            message: {
                en: "Your groups is invited to {{values.name}}Event.",
                ar: "Your groups is invited to {{values.name}}Event."
            },
            title: {
                en: "Event Invite ",
                ar: "Event Invite  ar"
            }
        },
        8: {
            keys: [],
            message: {
                en: "You are now the groupAdmin of {{name}}.",
                ar: "You are now the groupAdmin of {{name}}."
            },
            title: {
                en: "Group Admin",
                ar: "Group Admin ar"
            }
        },
        9: {
            keys: [],
            message: {
                en: "Maximum limit Reached for the Event",
                ar: "Maximum limit Reached for the Event"
            },
            title: {
                en: "Max Limit Reached",
                ar: "Max Limit Reached ar"
            }
        },
        10: {
            keys: [],
            message: {
                en: "{{values.eventName}} Event time is changed.",
                ar: "{{values.eventName}} Event time is changed."
            },
            title: {
                en: "Event time changed",
                ar: "Event time changed ar"
            }
        },
        11: {
            keys: [],
            message: {
                en: "{{eventName}} Event has started.",
                ar: "{{eventName}} Event has started."
            },
            title: {
                en: "Event has started",
                ar: "Event has started ar"
            }
        },
        12: {
            keys: [],
            message: {
                en: "{{eventName}} Event has ended.",
                ar: "{{eventName}} Event has ended."
            },
            title: {
                en: "Event has ended",
                ar: "Event has ended ar"
            }
        },
        13: {
            keys: [],
            message: {
                en: "New Message Received from {{receiverId.userName}} .",
                ar: "New Message Received from {{receiverId.userName}} ."
            },
            title: {
                en: "New Message Received ",
                ar: "New Message Received  ar"
            }
        },
        14: {
            keys: [],
            message: {
                en: "New Message Received in team {{teamName}} .",
                ar: "New Message Received in team {{teamName}} ."
            },
            title: {
                en: "New Message Received in team",
                ar: "New Message Received in team ar"
            }
        },
        15: {
            keys: [],
            message: {
                en: "New Message Received in Group {{name}} .",
                ar: "New Message Received in Group {{name}} ."
            },
            title: {
                en: "New Message Received in Group",
                ar: "New Message Received in Group ar"
            }
        },
        16: {
            keys: [],
            message: {
                en: "New Message Received in Event {{eventName}} .",
                ar: "New Message Received in Event {{eventName}} ."
            },
            title: {
                en: "New Message Received in Event",
                ar: "New Message Received in Event ar"
            }
        }
    },
    PUSH_TYPE_KEYS: {
        USER_LIKED_EVENT: 1,
        USER_DISLIKED_EVENT: 2,
        USER_LIKED_POLL: 3,
        EVENT_ENTERED: 4,
        INVITED_TO_EVENT: 5,
        INVITED_TO_GROUP: 6,
        INVITED_GROUP: 7,
        ADDED_GROUP_ADMIN: 8,
        MAX_LENGTH_REACHED: 9,
        EVENT_TIME_CHANGED: 10,
        EVENT_STARTED: 11,
        EVENT_ENDED: 12,
        SEND_MESSAGE_TO_SINGLE_USER: 13,
        NEW_MESSAGE_IN_TEAM: 14,
        NEW_MESSAGE_IN_GROUP: 15,
        NEW_MESSAGE_IN_EVENT: 16
    },
    PUSHROLE: {
        USER: 1,
        ADMIN: 2
    },
    constant: {
        INVALID_CREDENTIALS : "Invalid credentials.",
        ACCOUNT_NOT_VERIFIED: 'Account not verified.',
        ACCOUNT_BLOCKED: 'Account blocked.',
        ACCOUNT_LOGIN_SUCCESSFULLY : "Account login successfully.",
        ACCOUNT_LOGOUT_SUCCESSFULLY : "Account logout successfully.",
        DATA_FETCHED : "Data fetched.",
        EMAIL_ALREADY_IN_USE : "Email already in use.",
        PHONE_ALREADY_IN_USE : "Phone already in use.",
        PROFILE_UPDATED_SUCCESSFULLY : "Profile updated successfully.",
        PASSWORDS_SHOULD_BE_DIFFERENT : "Password should be different.",
        ACCOUNT_NOT_FOUND : "Account not found.",
        PASSWORD_CHANGED_SUCCESSFULLY : "Password changed successfully.",
        ACCESS_DENIED : "Access Denied",
        EMAIL_ALREADY_EXISTS : "Email already exist.",
        PHONE_ALREADY_EXISTS : "Phone already exist.",
        SUBADMIN_CREATED_SUCCESSFULLY : "Sub Admin Created Successfully.",
        NOTFOUND: 'Not found.',
        SUCCESS: "Success",
        CREATED_SUCCESSFULLY: "Created Successfully",
        UNABLE_TO_UPDATE : "Unable to update.",
        EVENTS_UPDATED_SUCCESSFULLY : "Events updated successfully.",
        PLEASE_ENTER_VALID_POLL : "Please enter at least two options for a valid poll.",
        POLL_ALLREADY_EXIST : "Poll Already Exist.",
        POLL_ADDED_SUCCESSFULLY : "Poll Added successfully.",
        POLL_DELETED_SUCCESSFULLY : "Poll deleted successfully.",
        POLL_UPDATED_SUCCESSFULLY : "Poll updated successfully.",
        POLL_DOES_NOT_EXISTS : "Poll does not exists.",
        POLL_NOT_DELETED : "Poll not deleted.",
        SUCCESFULLY_JOINED : "Successfully joined.",
        EVENT_IS_ALREADY_JOINED_BY_YOU:"Event is already joined by you",
        MAXIMUM_LIMIT_REACHED :"Maximum limit reached you are currently in waiting room.",
        SUCCESSFULLY_DECLINED : "Successfully declined.",
        EVENT_IS_ALREADY_DECLINED_BY_YOU : "Event is already declined by you.",
        UNABLE_TO_ADD : "Unable to add new event type.",
        EVENT_TYPE_UPDATED_SUCCESSFULLY : "Event type updated successfully.",
        UNABLE_TO_DELETE_EVENT_TYPE : "Unable to delete event type.",
        UNABLE_TO_REMOVE : "Unable to remove user.",
        PHONE_MISSING : "Phone no missing.",
        DIAL_CODE_MISSING : "Dial Code missing.",
        DOCUMENT_MISSING : "Document missing.",
        MESSAGE_MISSING : "Message missing.",
        EMAIL_MISSING : "Email missing.",
        CONTACTS_NOT_SYNCED : "Contacts Not Synced",
        NUMBER_DOES_NOT_EXISTS : "A user with that phone number does not exist.",
        UPLOADING_ERROR : "UPLOADING_ERROR",
        INVALID_OTP : "Invalid OTP",
        USER_REPORTED : "User Reported Successfully",
        YOU_CANT_REPORT_YOURSELF : "You cannot report yourself",
        ALREADY_REPORTED : "You have already reported the user",
        CANNOT_INVITE_UNTIL_YOU_JOIN : "You can't invite to others member until you join",
        EVENT_NOT_UPDATED : "Event Not Updated",
        UNABLE_TO_DELETE_EVENT : "Unable to delete Event",
        EVENT_TYEP_NOT_FOUND : "EventType not found.",
        EVENT_DOES_NOT_EXIST : "Event does not exists.",
        ALREADY_IN_WAITING_LIST : "You are already in waiting list",
        POLL_ALREADY_LIKED : "Poll Already Liked",
        POLL_ALREADY_DISLIKED : "Poll Already Disliked",
        GROUP_NOT_FOUND : "Group not found",
        GROUP_NOT_UPDATED : "Unable to update the group",
        GROUP_ALREADY_JOINED : "You have already joined this group.",
        NOT_INVITED_TO_GROUP : "You are not invited this group",
        ALREADY_LEFT_GROUP : "You have already left the group",
        TEAM_ALREADY_EXISTS : "Team already exists",
        UNABLE_TO_ADD_TEAM : "Unable to add Team",
        UNABLE_TO_MUTE : "Unable to mute",
        NO_MESSAGE_FOUND : "No message found with this user",
        RESPONSE_ALREADY_RECORDED : "Response already recorded",
        UNABLE_TO_DELETE_CHAT : "Unable to delete chat",
        USER_NOT_FOUND : "User not found",
        ACCOUNT_CREATED_SUCCESSFULLY : "Account created successfully",
        IMAGE_UPLOADED : "Image uploaded successfully",
        OTP_SENT : "Otp sent successfully",
        OTP_VERIFIED : "Otp Verified",
        EVENTS_UPDATED_SUCCESSFULLY : "Event Updated Successfully",
        DELETE_SUCCESSFULLY : "Deleted Successfully",
        GROUP_UPDATED : "Group Updated Successfully",
        SUCCESSFULLY_JOINED : "Successfully joined",
        REQUEST_SENT : "Successfully sent request",
        ACCEPTED_ALL_MEMBERS : "Accepted request for all members",
        NOTIFICATION_REMOVED : "Notification Removed Successfully",
        EVENT_LIKED : "Event liked",
        POLL_DISLIKED : "Poll Disliked",
        POLL_LIKED : "Poll Liked",
        EVENT_DISLIKED : "Event DisLiked",
        IGNORE_SUCCESS : "Ignore successfull"

    },
    MSG_FOR: {
        USER: 1,
        TEAM: 2,
        GROUP: 3,
        EVENT: 4
    }
};