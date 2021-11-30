  "use strict";
  const express = require("express");
  process.env.NODE_CONFIG_DIR = 'config/';
  const app = express();
  const server = require("http").createServer(app);
  const cors = require("cors");
  const logger = require("morgan");
  const bodyParser = require("body-parser");
  const connection = require("./common/connection");
  const processes = require("./common/processes");
  var config = require( './config/config' );
  process.argv.NODE_APP_INSTANCE = "";
  const responses = require("./common/responses");
  const v1Routes = require("./v1/routes/index");
  const socket = require('./socket/index')

  app.use("/", express.static(__dirname + "/public"));
  app.use(cors());
  app.use(responses());
  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use("/api/v1", v1Routes);


  // 404, Not Found
  app.use((req, res, next) => res.error(404, "NOT_FOUND"));

  app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
  });

  // Error handling
  app.use((error, req, res, next) => {
    console.error(error);
    return res.error(208, error.message || error);
  });

  // Listening & Initializing
  server.listen(config.PORT, async () => {
    console.log(`Environment:`, process.env.NODE_ENV);
    console.log(`Running on:`, config.PORT);
    console.log('start socketInitialize');
    let io = require('socket.io')(server);
    socket(io)
    connection.mongodb();
    processes.init();
  });