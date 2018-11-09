"use strict";
var utilities_1 = require("../utilities/utilities");
function Max(max, value) {
    if (!utilities_1.Utilities.isNumber(value))
        return false;
    return value <= max;
}
exports.Max = Max;
