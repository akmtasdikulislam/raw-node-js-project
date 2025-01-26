/*
 * Title: User Handler
 * Description: Handler to handle user related routes
 * Author: Akm Tasdikul Islam
 * Date: 25/01/2025
 *
 */

// Dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");

// Module scaffolding
const handler = {};
handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean"
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Check if user already exists in the system
    data.read("users", phone, (err, userData) => {
      if (err) {
        // Store the user in the system
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(201, { message: "User created successfully" });
          } else {
            callback(500, {
              error: "Failed to store user data in the system",
            });
          }
        });
      } else {
        callback(400, {
          error: "User already exists",
        });
      }
    });
  } else {
    callback(400, {
      error: "Missing required fields",
    });
  }
};

// @TODO: Authenctication check
handler._users.get = (requestProperties, callback) => {
  // Check if user already exists in the system
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // Lookup the user
    data.read("users", phone, (err, data) => {
      const userData = {
        ...parseJSON(data),
      };
      if (!err && userData) {
        // Remove the hashed password
        delete userData.password;
        callback(200, userData);
      } else {
        callback(404, {
          error: "User not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "Missing required fields",
    });
  }
};

// @TODO: Authenctication check
handler._users.put = (requestProperties, callback) => {
  // Check validation of the data
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      // Lookup the user
      data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          const user = {
            ...parseJSON(userData),
          };
          if (firstName) {
            user.firstName = firstName;
          }
          if (lastName) {
            user.lastName = lastName;
          }
          if (password) {
            user.password = hash(password);
          }

          // Store the user in the system
          data.update("users", phone, user, (err) => {
            if (!err) {
              callback(200, { message: "User updated successfully" });
            } else {
              callback(500, {
                error: "Failed to update user data in the system",
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
      callback(400, {
        error: "Missing required fields",
      });
    }
  } else {
    callback(400, {
      error: "Invalid phone number. Please provide a valid phone number.",
    });
  }
};

// @TODO: Authenctication check
handler._users.delete = (requestProperties, callback) => {
  // Check validation of the data
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    // Lookup the user
    data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        data.delete("users", phone, (err) => {
          if (!err) {
            callback(200, { message: "User deleted successfully" });
          } else {
            callback(500, {
              error: "Failed to delete user data in the system",
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
    callback(400, {
      error: "Invalid phone number. Please provide a valid phone number.",
    });
  }
};

module.exports = handler;
