"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseProcessor = (function () {
    function BaseProcessor(executionContext, processorDef) {
        this.executionContext = executionContext;
        this.processorDef = processorDef;
    }
    BaseProcessor.prototype.fx = function (args) {
        return Promise.resolve({
            successful: false
        });
    };
    return BaseProcessor;
}());
exports.BaseProcessor = BaseProcessor;
