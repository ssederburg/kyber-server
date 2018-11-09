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
var RawResponse = (function (_super) {
    __extends(RawResponse, _super);
    function RawResponse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RawResponse.prototype.fx = function (args) {
        var _this = this;
        var result = new Promise(function (resolve, reject) {
            try {
                return resolve({
                    successful: true,
                    message: 'OK',
                    data: Object.assign({}, _this.executionContext.raw)
                });
            }
            catch (err) {
                reject(err);
            }
        });
        return result;
    };
    return RawResponse;
}(schemas_1.BaseProcessor));
exports.RawResponse = RawResponse;
