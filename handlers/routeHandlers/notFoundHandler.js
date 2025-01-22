/*
 * Title: Not Found Handler
 * Decription: 404 Not Found Handler
 * Author: Akm Tasdikul Islam
 * Date: 22/01/2025
 *
 */

// Module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  callback(404, {
    message: "Your requested url was not found!",
  });
};

module.exports = handler;
