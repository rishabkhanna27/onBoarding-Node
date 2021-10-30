const functions = require("./functions");

module.exports = () => (req, res, next) => {
    // success response
    res.success = (message, data) => {
        message = functions.prettyCase(message);
        return res.send({ statusCode: 200, message, data: data || {}, status:1 });
    };

    // error resposne
    res.error = (code, message, data) => {
        message = functions.prettyCase(message);
        res.status(208).send({ statusCode: code, message, data: data || {}, status :0 });
    };

    // proceed forward
    next();
};
