/*
 * Title: Token Handler
 * Description: Handle Token related request
 * Author: Akm Tasdikul Islam
 * Date: 26/01/2025
 *
 */

// Dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const { createRandomString } = require("../../helpers/utilities");

// Module scaffolding
const handler = {};
handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
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

  if (phone && password) {
    data.read("users", phone, (err, userData) => {
      const hashedPassword = hash(password);

      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 1000 * 60 * 60;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };
        // Store the token
        data.create("tokens", tokenId, tokenObject, (error) => {
          if (!error) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "Token could not be created",
            });
          }
        });
      } else {
        callback(400, {
          error: "Password is not correct",
        });
      }
    });
  } else {
    callback(400, {
      error: "Missing required fields",
    });
  }
};

handler._token.get = (requestProperties, callback) => {
  // Check validation of id
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // Lookup the token
    data.read("tokens", id, (err, data) => {
      const tokenData = {
        ...parseJSON(data),
      };
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, {
          error: "Token not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "Invalid token id",
    });
  }
};

handler._token.put = (requestProperties, callback) => {
  // Check validation of id
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : false;

  if (id && extend) {
    data.read("tokens", id, (err, token) => {
      let tokenData = parseJSON(token);
      if (tokenData.expires > Date.now()) {
        tokenData.expires = Date.now() + 1000 * 60 * 60;
        // Store updated token
        data.update("tokens", id, tokenData, (error) => {
          if (!error) {
            callback(200, {
              success: "Token is extended",
            });
          } else {
            callback(500, {
              error: "Could not update token",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token is expired",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was an error in the request",
    });
  }
};

handler._token.delete = (requestProperties, callback) => {
  // Check validation of the data
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // Lookup the user
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, { message: "Token deleted successfully" });
          } else {
            callback(500, {
              error: "Failed to delete token data in the system",
            });
          }
        });
      } else {
        callback(404, {
          error: "Token not found",
        });
      }
    });
  } else {
    callback(400, {
      error: "Invalid token id. Please provide a valid token id.",
    });
  }
};

handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
