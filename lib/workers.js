/*
 * Title: Workers Library
 * Description: Library for handling workers
 * Author: Akm Tasdikul Islam
 * Date: 26/01/2025
 *
 */

// Dependencies
const url = require("url");
const http = require("http");
const https = require("https");
const data = require("./data");
const { parseJSON } = require("../helpers/utilities");
const { sendTwilioSms } = require("../helpers/notifications");

// Worker object - module scaffolding

const workers = {};

// Lookup all the checks
workers.gatherAllChecks = () => {
  // Get all the checks
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // Read the checkData
        data.read("checks", check, (error, checkData) => {
          if (!error && checkData) {
            // Pass to the check validator
            workers.validateCheckData(parseJSON(checkData));
          } else {
            console.log("Error: Could not find check data");
          }
        });
      });
    } else {
      console.log("Error: Could not find any checks to process");
    }
  });
};

// Validate check data
workers.validateCheckData = (data) => {
  let checkData = data;
  if (checkData && checkData.id) {
    checkData.state =
      typeof checkData.state === "string" &&
      ["up", "down"].indexOf(checkData.state) > -1
        ? checkData.state
        : "down";
    checkData.lastChecked =
      typeof checkData.lastChecked === "number" && checkData.lastChecked > 0
        ? checkData.lastChecked
        : false;

    // Pass to the next process
    workers.performCheck(checkData);
  } else {
    console.log("Error: Check was invalid or not properly formatted");
  }
};

// Perform the check, send the checkData to the check validator
workers.performCheck = (checkData) => {
  // Prepare the initial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };
  // Mark the outcome has not been checked yet
  let outcomeSent = false;
  // parse the hostname and full url from the checkData
  let parseUrl = url.parse(checkData.protocol + "://" + checkData.url, true);
  let hostName = parseUrl.hostname;
  let path = parseUrl.path; // Using path and not pathname because we want the query string

  // Construct the request
  let requestDetails = {
    protocol: checkData.protocol + ":",
    hostname: hostName,
    method: checkData.method.toUpperCase(),
    path: path,
    timeout: checkData.timeoutSeconds * 1000,
  };

  const protocolToUse = checkData.protocol === "http" ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    const status = res.statusCode;
    // Update the checkOutcome and pass the data along
    checkOutcome = {
      error: false,
      responseCode: status,
    };
    // Update the checkOutcome and pass the data along
    if (!outcomeSent) {
      workers.processCheckOutcome(checkData, checkOutcome);
      outcomeSent = true;
    }
  });
  // Bind to the error event so it doesn't get thrown
  req.on("error", (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };
    console.log("Error: " + e);
    // Update the checkOutcome and pass the data along
    if (!outcomeSent) {
      workers.processCheckOutcome(checkData, checkOutcome);
      outcomeSent = true;
    }
  });
  //  Timeout the request
  req.on("timeout", () => {
    checkOutcome = {
      error: true,
      value: "timeout",
    };
    console.log("Request timed out");
    // Update the checkOutcome and pass the data along
    if (!outcomeSent) {
      workers.processCheckOutcome(checkData, checkOutcome);
      outcomeSent = true;
    }
  });
  // Request send
  req.end();
};

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = (checkData, checkOutcome) => {
  // Decide if the check is up or down
  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    checkData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  // Decide if an alert is warranted
  let alertWarranted =
    checkData.lastChecked && checkData.state !== state ? true : false;

  // Update the check data
  let newCheckData = checkData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // Save the updates
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // Send the new checkData to the next phase in the process if needed
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Check outcome has not changed, no alert needed");
      }
    } else {
      console.log("Error trying to save updates to one of the checks");
    }
  });
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(
        `Success: User was alerted to a status change via SMS: ${msg}`
      );
    } else {
      console.log(
        "Error: Could not send SMS alert to user who had a state change in their check",
        err
      );
    }
  });
};

// Timer to execute the worker process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

workers.init = () => {
  // Execute all the checks
  workers.gatherAllChecks();

  // Call the loop so that checks continue
  workers.loop();
};

// Export the module
module.exports = workers;
