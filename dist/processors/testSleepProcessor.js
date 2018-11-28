"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var schemas_1 = require("../schemas");
var utilities_1 = require("../utilities/utilities");
var TestSleepProcessor = (function (_super) {
    __extends(TestSleepProcessor, _super);
    function TestSleepProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestSleepProcessor.prototype.fx = function (args) {
        var result = new Promise(function (resolve, reject) {
            try {
                var timeout = 0;
                if (!args || !args.timeout || !utilities_1.Utilities.isNumber(args.timeout)) {
                    console.log("KyberServer.TestSleepProcessor.Warning: Invalid value set in schematic for args.timeout. Using default of 1 second.");
                    timeout = 1000;
                }
                else {
                    timeout = args.timeout;
                }
                setTimeout(function () {
                    return resolve({
                        successful: true
                    });
                }, timeout);
            }
            catch (err) {
                return reject({
                    successful: false,
                    message: "TestSleepProcessor.Error",
                    data: err
                });
            }
        });
        return result;
    };
    return TestSleepProcessor;
}(schemas_1.BaseProcessor));
exports.TestSleepProcessor = TestSleepProcessor;
