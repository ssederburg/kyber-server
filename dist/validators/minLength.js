"use strict";
var utilities_1 = require("../utilities/utilities");
function MinLength(len, value) {
    if (!utilities_1.Utilities.isString(value))
        value = value.toString();
    return value.length >= len;
}
exports.MinLength = MinLength;