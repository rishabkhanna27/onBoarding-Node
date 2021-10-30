const constant = require('../constants/constant')

module.exports = {

    checkBlank: async (res, manValues) => {
        var object = manValues;
        for (var prop in object) {
            if (`${object[prop]}` == undefined || `${object[prop]}` == `undefined` || `${object[prop]}` == '') {
                return {
                    success: constant.FALSE,
                    message: `${prop} ${constant.REQUIRE}`
                }
            }
        }
        return false;
    },
    toDecimals: async (val, decimal = 2) => {
        const base = Math.pow(10, decimal);
        return Math.round(val * base) / base;
    }

}