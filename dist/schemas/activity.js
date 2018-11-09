"use strict";
var _1 = require("./");
var Activity = (function () {
    function Activity() {
        this.id = '';
        this.condition = '';
        this.ordinal = 0;
        this.description = null;
        this.executionMode = _1.ExecutionMode.Sequential;
        this.processes = [];
        this.activities = [];
    }
    return Activity;
}());
exports.Activity = Activity;
