const Services = require("../services/EmalService");

module.exports.init = async () => {
    console.log("Process Initialized");

    process.on("sendEmail", async (args) => {
        await Services.send(args);
    });
    process.on("sendReportEmail", async (args) => {
        await Services.sendReport(args);
    });
    process.on("sendBroadCastEmail", async (args) => {
        await Services.sendBroadCastEmail(args);
    });
};
