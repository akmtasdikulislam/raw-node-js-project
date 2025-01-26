/*
 * Title: Notifications Library
 * Description: Utility functions for notifications
 * Author: Akm Tasdikul Islam
 * Date: 26/01/2025
 *
 */

// Dependencies
const https = require("https");
const querystring = require("querystring");
const { twilio } = require("./environments");

// Module scaffolding

const notificaitons = {};

// Send SMS to user using twilio api

notificaitons.sendTwilioSms = (phone, msg, callback) => {
  // input validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;
  const userMSG =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMSG) {
    // Configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMSG,
    };

    // Stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // Instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully if the request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on("error", (e) => {
      callback(e);
    });

    req.write(stringifyPayload);
    req.end();
  } else {
    callback("Given parameters were missing or invalid!");
  }
};

// Module exports
module.exports = notificaitons;
