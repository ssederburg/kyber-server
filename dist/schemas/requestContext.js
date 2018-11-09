"use strict";
var RequestContext = (function () {
    function RequestContext() {
        this.timedout = false;
        this.starttime = null;
    }
    return RequestContext;
}());
exports.RequestContext = RequestContext;
