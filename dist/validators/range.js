"use strict";
var utilities_1 = require("../utilities/utilities");
function Range(min, max, value) {
    if (!utilities_1.Utilities.isNumber(value))
        return false;
    return value >= min && value <= max;
}
exports.Range = Range;
