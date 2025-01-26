/*
 * Title: Check Handler
 * Description: Handler to handle user defined checks
 * Author: Akm Tasdikul Islam
 * Date: 26/01/2025
 *
 */

// Dependencies
const data = require("../../lib/data");
const { parseJSON, createRandomString } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../helpers/environments");

// Module scaffolding
const handler = {};
handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._checks[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._checks = {};

handler._checks.post = (requestProperties, callback) => {
  // Validate inputs
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  const method =
    typeof requestProperties.body.method === "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // Look up user phone by reading the token
    data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        let userPhone = parseJSON(tokenData).phone;
        //    Lookup user
        data.read("users", userPhone, (erorr, userData) => {
          if (!erorr && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };
                  // Store the check in the database
                  data.create("checks", checkId, checkObject, (error) => {
                    if (!error) {
                      // Add check id to user's object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // Update the user
                      data.update(
                        "users",
                        userPhone,
                        userObject,
                        (updateError) => {
                          if (!updateError) {
                            // Send success response
                            callback(200, {
                              message: "Check created successfully",
                              checkObject,
                            });
                          } else {
                            callback(500, {
                              error: "There was a problem creating the check",
                            });
                          }
                        }
                      );
                    } else {
                      callback(500, {
                        error: "There was a problem creating the check",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: "You have reached the maximum number of checks",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication failed",
                });
              }
            });
          } else {
            callback(404, {
              error: "User not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failed",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem with the user data you provided",
    });
  }
};

handler._checks.get = (requestProperties, callback) => {
  // Check validation of id
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // Lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // Send success response
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: "Authentication failed",
              });
            }
          }
        );
      } else {
        callback(404, {
          error: "Check not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "Invalid check id",
    });
  }
};

handler._checks.put = (requestProperties, callback) => {
  // Check validation of id
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  // Validate inputs
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  const method =
    typeof requestProperties.body.method === "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);
          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;
          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                // Update the check
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }
                // Save the updated check
                data.update("checks", id, checkObject, (err) => {
                  if (!err) {
                    callback(200, {
                      message: "Check updated",
                    });
                  } else {
                    callback(500, {
                      error: "Could not update the check",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication failed",
                });
              }
            }
          );
        } else {
          callback(404, {
            error: "Check not found",
          });
        }
      });
    } else {
      callback(400, {
        error: "Missing required fields",
      });
    }
  } else {
    callback(400, {
      error: "Invalid check id",
    });
  }
};

handler._checks.delete = (requestProperties, callback) => {
  // Check validation of id
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // Lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // Delete the check
              data.delete("checks", id, (error) => {
                if (!error) {
                  data.read(
                    "users",
                    parseJSON(checkData).userPhone,
                    (erorr, userData) => {
                      if (!erorr && userData) {
                        let userObject = parseJSON(userData);
                        let userChecks =
                          typeof userObject.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];
                        // Remove the deleted check id from the user's check array
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // Update the user
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userObject.phone,
                            userObject,
                            (updateError) => {
                              if (!updateError) {
                                callback(200, {
                                  message: "Check deleted",
                                });
                              } else {
                                callback(500, {
                                  error: "Could not delete the check",
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error: "Check was found but couldn't be deleted",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "Check was found but couldn't be deleted",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, {
                    error: "Could not delete the check",
                  });
                }
              });
            } else {
              callback(403, {
                error: "Authentication failed",
              });
            }
          }
        );
      } else {
        callback(404, {
          error: "Check not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "Invalid check id",
    });
  }
};

module.exports = handler;
