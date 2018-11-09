"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var schemas_1 = require("../schemas");
var SchematicResponse = (function (_super) {
    __extends(SchematicResponse, _super);
    function SchematicResponse() {
        var _this = _super.apply(this, arguments) || this;
        _this.httpStatus = 200;
        _this.useResolver = false;
        _this.schema = {};
        return _this;
    }
    SchematicResponse.prototype.resolve = function (executionContext) {
        return null;
    };
    return SchematicResponse;
}(schemas_1.ProcessorDef));
exports.SchematicResponse = SchematicResponse;