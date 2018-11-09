"use strict";
var utilities_1 = require("../utilities/utilities");
function ContainsAny(input, value) {
    if (!utilities_1.Utilities.isArray(input))
        return false;
    var wasOne = false;
    input.forEach(function (item) {
        if (!wasOne && value.indexOf(item) >= 0) {
            wasOne = true;
        }
    });
    return wasOne;
}
exports.ContainsAny = ContainsAny;
