const log4js = require("log4js");

log4js.configure({
  appenders: {
    file: { 
      type: "file", 
      filename: "logger.log",
      layout: { type: "pattern", pattern: "%d [%p] %c - %m%n" }
    },
    console: { type: "stdout" }
  },
  categories: {
    default: {
      appenders: ["file", "console"],
      level: "debug" // 👈 allows all levels
    }
  }
});

const logger = log4js.getLogger();
logger.level = "debug"; // extra safety

module.exports = logger;