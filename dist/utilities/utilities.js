"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var config = require("config");
var util = require("util");
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.evalExpression = function (expression, source) {
        var exprs = expression.split('||');
        if (!exprs || exprs.length === 0) {
            return null;
        }
        var result = null;
        _.forEach(exprs, function (expr) {
            if (Utilities.isNullOrUndefined(result) && expr) {
                if (expr.indexOf('req.query.') === 0) {
                    result = source.query[expr.replace('req.query.', '')];
                }
                if (expr.indexOf('req.body.') === 0) {
                    result = source.body[expr.replace('req.body.', '')];
                }
                if (expr.indexOf('process.env.') === 0) {
                    result = process.env[expr.replace('process.env.', '')];
                }
                if (expr.indexOf('config.') === 0) {
                    result = config[expr.replace('config.', '')];
                }
                if (expr.indexOf('req.cookies.') === 0) {
                    result = source.cookies[expr.replace('req.cookies.', '')];
                }
                if (expr.indexOf('req.params.') === 0) {
                    result = source.params[expr.replace('req.params.', '')];
                }
                if (expr.indexOf('req.signedCookies.') === 0) {
                    result = source.params[expr.replace('req.signedCookies.', '')];
                }
                if (expr.indexOf('req.headers.') === 0) {
                    result = source.get(expr.replace('req.headers.', ''));
                }
                if (expr.indexOf('=') === 0) {
                    result = expr.replace('=', '');
                }
                if (expr.indexOf('req.id') === 0) {
                    result = source.id;
                }
            }
        });
        return result;
    };
    Utilities.isDataType = function (value, dataType) {
        switch (dataType) {
            case 'string':
                return Utilities.isString(value);
            case 'date':
                return Utilities.isDate(value);
            case 'boolean':
                return Utilities.isBoolean(value);
            case 'number':
                return Utilities.isNumber(value);
            default:
                console.log("Utilities.isDataType: No record of data type " + dataType + ". Test ignored.");
                return true;
        }
    };
    Utilities.isNullOrUndefined = function (value) {
        return value === null || value === undefined;
    };
    Utilities.isArray = function (value) {
        return value.isArray();
    };
    Utilities.isDate = function (value) {
        return util.types.isDate(value);
    };
    Utilities.isRegEx = function (value) {
        return util.types.isRegExp(value);
    };
    Utilities.isBoolean = function (value) {
        return typeof value === 'boolean';
    };
    Utilities.isFunction = function (value) {
        return typeof value === 'function';
    };
    Utilities.isNull = function (value) {
        return value === null;
    };
    Utilities.isNumber = function (value) {
        return typeof value === 'number';
    };
    Utilities.isObject = function (value) {
        return value !== null && typeof value === 'object';
    };
    Utilities.isString = function (value) {
        return typeof value === 'string';
    };
    Utilities.prototype.readValue = function (documentPath, source) {
        if (documentPath.indexOf('/') < 0)
            return source[documentPath];
        var paths = documentPath.split('/');
        var reader = source;
        paths.forEach(function (element) {
            if (reader !== null)
                reader = reader[element];
        });
        return reader;
    };
    Utilities.prototype.writeValue = function (documentPath, value, source) {
        if (documentPath.indexOf('.') < 0)
            return source[documentPath] = value;
        var paths = documentPath.split('/');
        var reader = source;
        paths.forEach(function (element, index) {
            if (index >= paths.length - 1) {
                return reader[element] = value;
            }
            reader = reader[element];
        });
    };
    return Utilities;
}());
exports.Utilities = Utilities;
