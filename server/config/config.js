// Environment Variable Configuration File

var env = process.env.NODE_ENV || "development";

if (env === "test" || env === "development") {
    const config = require("./config.json");
    var envConfig = config[env];
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}
