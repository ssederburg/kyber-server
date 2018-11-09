"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _1 = require("./");
var GlobalSchematic = (function (_super) {
    __extends(GlobalSchematic, _super);
    function GlobalSchematic() {
        var _this = _super.apply(this, arguments) || this;
        _this.eventHandlers = [];
        _this.beforeEachExecution = [];
        _this.afterEachExecution = [];
        _this.tests = [];
        _this.onStartup = [];
        _this.onShutdown = [];
        return _this;
    }
    return GlobalSchematic;
}(_1.Schematic));
exports.GlobalSchematic = GlobalSchematic;
