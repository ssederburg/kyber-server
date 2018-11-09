"use strict";
var ProcessorResponse = (function () {
    function ProcessorResponse() {
        this.successful = true;
        this.message = null;
        this.httpStatus = 200;
        this.data = {};
    }
    return ProcessorResponse;
}());
exports.ProcessorResponse = ProcessorResponse;
