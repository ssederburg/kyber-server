"use strict";
var utilities_1 = require("../utilities/utilities");
function Contains(input, value) {
    if (!utilities_1.Utilities.isString(value))
        value = value.toString();
    return value.indexOf(input) >= 0;
}
exports.Contains = Contains;