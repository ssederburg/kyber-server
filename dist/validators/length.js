"use strict";
var utilities_1 = require("../utilities/utilities");
function Length(len, value) {
    if (!utilities_1.Utilities.isString(value))
        value = value.toString();
    return value.length === len;
}
exports.Length = Length;
