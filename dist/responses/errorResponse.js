"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var schemas_1 = require("../schemas");
var ErrorResponse = (function (_super) {
    __extends(ErrorResponse, _super);
    function ErrorResponse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorResponse.prototype.fx = function (args) {
        var _this = this;
        var result = new Promise(function (resolve, reject) {
            try {
                return resolve({
                    successful: false,
                    message: 'ERROR',
                    data: Object.assign({}, {
                        httpStatus: _this.executionContext.httpStatus,
                        errors: _this.executionContext.errors,
                        warnings: _this.executionContext.warnings,
                        origin: "ErrorResponse.Resolve"
                    })
                });
            }
            catch (err) {
                reject({
                    successful: false,
                    message: 'ERROR',
                    data: Object.assign({}, {
                        httpStatus: _this.executionContext.httpStatus || 500,
                        errors: _this.executionContext.errors || ['Unknown Error'],
                        warnings: _this.executionContext.warnings || [],
                        origin: "ErrorResponse.Reject"
                    })
                });
            }
        });
        return result;
    };
    return ErrorResponse;
}(schemas_1.BaseProcessor));
exports.ErrorResponse = ErrorResponse;
