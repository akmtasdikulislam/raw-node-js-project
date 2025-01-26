/*
 * Title: Data Storage and File Operations Library
 * Description: A library for handling file-based data storage operations including creating, reading, updating and deleting JSON files
 * Author: Akm Tasdikul Islam
 * Date: 25/01/2025
 *
 */

// Dependencies
const fs = require("fs");
const path = require("path");

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to a file
lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to a string
      const stringData = JSON.stringify(data);

      //   Write to file and close it
      fs.writeFile(fileDescriptor, stringData, (writeErr) => {
        if (!writeErr) {
          fs.close(fileDescriptor, (closeErr) => {
            if (!closeErr) {
              callback(false);
            } else {
              callback("Could not close the file after writing");
            }
          });
        } else {
          callback("Could not write to the file");
        }
      });
    } else {
      callback("Could not create new file, it may already exists");
    }
  });
};

// Read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, "utf-8", (err, data) => {
    callback(err, data);
  });
};

// Update data in a file
lib.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to a string
      const stringData = JSON.stringify(data);
      // Truncate the file
      fs.ftruncate(fileDescriptor, () => {
        // Write to the file and close it
        fs.writeFile(fileDescriptor, stringData, (writeErr) => {
          if (!writeErr) {
            fs.close(fileDescriptor, (closeErr) => {
              if (!closeErr) {
                callback(false);
              } else {
                callback("Could not close the file after writing", closeErr);
              }
            });
          } else {
            callback("Could not write the file", writeErr);
          }
        });
      });
    } else {
      callback("Could not open the file for updating. It may not exist", err);
    }
  });
};

// Delete a file
lib.delete = (dir, file, callback) => {
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting the file");
    }
  });
};

// List all the files in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir}${dir}`, (err, fileNames) => {
    if (!err && fileNames && fileNames.length > 0) {
      const trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json", ""));
      });
      callback(false, trimmedFileNames);
    } else {
      callback("Could not find any files in that directory");
    }
  });
};

module.exports = lib;
