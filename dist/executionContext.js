"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var utilities_1 = require("./utilities/utilities");
var events_1 = require("./events");
var _ = require("lodash");
var responses_1 = require("./responses");
var ExecutionContext = (function () {
    function ExecutionContext(req, schematic, sharedResources, kyberServer) {
        this.req = req;
        this.schematic = schematic;
        this.sharedResources = sharedResources;
        this.kyberServer = kyberServer;
        this.httpStatus = 200;
        this.correlationId = '';
        this.errors = [];
        this.warnings = [];
        this.log = [];
        this.raw = {};
        this.transformed = {};
        this.mapped = {};
        this.results = [];
        this.parameters = [];
        this.wasOneCriticalFailure = false;
        this.correlationId = req.id;
    }
    ExecutionContext.prototype.execute = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_1, response_1, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 8]);
                        return [4 /*yield*/, this.loadParameters()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.runActivities(this.schematic.activities)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.respond()];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, resolve(response)];
                    case 4:
                        err_1 = _a.sent();
                        if (!!this.wasOneCriticalFailure)
                            return [3 /*break*/, 6];
                        this.wasOneCriticalFailure = true;
                        return [4 /*yield*/, this.respond()];
                    case 5:
                        response_1 = _a.sent();
                        console.log("executionContext.execute.error: Throwing " + JSON.stringify(response_1, null, 1));
                        return [2 /*return*/, reject(response_1)];
                    case 6: return [4 /*yield*/, this.errorResponse()];
                    case 7:
                        response = _a.sent();
                        console.log("executionContext.execute.error.secondchance: Throwing " + JSON.stringify(response, null, 1));
                        return [2 /*return*/, reject(response)];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.getParameterValue = function (name) {
        var theParamRecord = _.find(this.parameters, { name: name });
        if (!theParamRecord)
            return null;
        return theParamRecord.value;
    };
    ExecutionContext.prototype.getSharedResource = function (name) {
        var theTypeRecord = _.find(this.sharedResources, { name: name });
        if (!theTypeRecord)
            return null;
        return theTypeRecord.instanceOfType;
    };
    ExecutionContext.prototype.runActivities = function (activities) {
        var _this = this;
        var result = new Promise(function (resolve, reject) {
            try {
                if (!activities || activities.length <= 0) {
                    return resolve(true);
                }
                var processTasks_1 = [];
                var counter_1 = 0;
                _.forEach(_.sortBy(activities, 'ordinal'), function (activityDef) { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.kyberServer.events.emit(events_1.KyberServerEvents.ActivityStarted, {
                                    source: "ExecutionContext.runActivities",
                                    correlationId: this.correlationId,
                                    schematic: this.schematic.id,
                                    activity: activityDef.id
                                });
                                processTasks_1.push(this.runProcesses(activityDef.id, activityDef.processes, activityDef.executionMode));
                                return [4 /*yield*/, Promise.all(processTasks_1).then(function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, this.runActivities(activityDef.activities)];
                                                case 1:
                                                    _a.sent();
                                                    counter_1 = counter_1 + 1;
                                                    if (counter_1 >= activities.length) {
                                                        this.kyberServer.events.emit(events_1.KyberServerEvents.ActivityEnded, {
                                                            source: "ExecutionContext.runActivities",
                                                            correlationId: this.correlationId,
                                                            schematic: this.schematic.id,
                                                            activity: activityDef.id
                                                        });
                                                        return [2 /*return*/, resolve(true)];
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }).catch(function (err) {
                                        console.log("ExecutionContext.runActivities.error: " + JSON.stringify(err));
                                        _this.errors.push("ExecutionContext.runActvities.error: " + err.message);
                                        _this.httpStatus = err.httpStatus;
                                        return reject(err);
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
            catch (err) {
                return reject(err);
            }
        });
        return result;
    };
    ExecutionContext.prototype.runProcesses = function (activityId, processes, executionMode) {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var tasks_1, response, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!processes || processes.length <= 0) {
                            return [2 /*return*/, resolve(true)];
                        }
                        tasks_1 = [];
                        _.forEach(_.sortBy(processes, 'ordinal'), function (process) {
                            _this.kyberServer.events.emit(events_1.KyberServerEvents.ProcessorStarted, {
                                source: "ExecutionContext.runProcesses",
                                correlationId: _this.correlationId,
                                schematic: _this.schematic.id,
                                activity: activityId,
                                processor: process.class.name.toString()
                            });
                            if (process.class && !process.className) {
                                var test = new process.class(_this, process);
                                tasks_1.push(_this.tryCatchWrapperForProcess(test, process).then(function (response) {
                                    _this.kyberServer.events.emit(events_1.KyberServerEvents.ProcessorEnded, {
                                        source: "ExecutionContext.runProcesses",
                                        correlationId: _this.correlationId,
                                        schematic: _this.schematic.id,
                                        activity: activityId,
                                        processor: process.class.name.toString(),
                                        response: Object.assign({}, response)
                                    });
                                }));
                            }
                        });
                        return [4 /*yield*/, Promise.all(tasks_1)];
                    case 1:
                        response = _a.sent();
                        if (response.indexOf(false) >= 0) {
                            return [2 /*return*/, resolve(false)];
                        }
                        return [2 /*return*/, resolve(true)];
                    case 2:
                        err_2 = _a.sent();
                        console.log("ExecutionContext.runProcesses.error: " + JSON.stringify(err_2, null, 1));
                        return [2 /*return*/, reject(err_2)];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.respond = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var theType, test, task, response, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        theType = null;
                        test = _.find(this.schematic.responses, { httpStatus: this.httpStatus });
                        if (!test) {
                            test = this.kyberServer.getGlobalSchematicResponse(this.httpStatus);
                            if (!test) {
                                console.log("kyber-server.executionContext.respond.error: no record of response for http status " + this.httpStatus);
                                theType = responses_1.RawResponse;
                            }
                            else {
                                theType = test.class;
                            }
                        }
                        else {
                            theType = test.class;
                        }
                        task = new theType(this, test);
                        return [4 /*yield*/, this.tryCatchWrapperForProcess(task, test)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, resolve(response.data || response)];
                    case 2:
                        err_3 = _a.sent();
                        this.errors.push("kyber-server.executionContext.respond().error");
                        return [2 /*return*/, reject(err_3)];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.tryCatchWrapperForProcess = function (processor, process) {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, processor.fx(process ? process.args : null)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, resolve(response)];
                    case 2:
                        err_4 = _a.sent();
                        return [2 /*return*/, reject(err_4)];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.loadParameters = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) {
            try {
                var wasOneInvalid_1 = false;
                if (_this.schematic && _this.schematic.parameters && _this.schematic.parameters.length > 0) {
                    _this.kyberServer.events.emit(events_1.KyberServerEvents.ExecutionContextBeforeLoadParameters, {
                        source: "ExecutionContext.loadParameters",
                        correlationId: _this.correlationId,
                        schematic: _this.schematic.id,
                        parameters: Object.assign({}, _this.schematic.parameters)
                    });
                    _.forEach(_this.schematic.parameters, function (parameter) {
                        var value = utilities_1.Utilities.evalExpression(parameter.source, _this.req);
                        parameter.isValid = true;
                        if (parameter.required && utilities_1.Utilities.isNullOrUndefined(value)) {
                            parameter.isValid = false;
                            _this.errors.push("Parameter " + parameter.name + " is required.");
                        }
                        if (value && parameter.dataType && parameter.isValid) {
                            parameter.isValid = utilities_1.Utilities.isDataType(value, parameter.dataType);
                            if (!parameter.isValid) {
                                _this.errors.push("Parameter " + parameter.name + " is an invalid data type. Should be " + parameter.dataType + ".");
                            }
                        }
                        if (value && parameter.isValid && parameter.whiteList && parameter.whiteList.length > 0) {
                            parameter.isValid = parameter.whiteList.indexOf(value) >= 0;
                            if (!parameter.isValid) {
                                _this.errors.push("Parameter " + parameter.name + " is invalid. Not in white list of values.");
                            }
                        }
                        if (value && parameter.isValid && parameter.blackList && parameter.blackList.length > 0) {
                            parameter.isValid = parameter.blackList.indexOf(value) < 0;
                            if (!parameter.isValid) {
                                _this.errors.push("Parameter " + parameter.name + " is invalid. Value is in black list of values.");
                            }
                        }
                        if (value && parameter.isValid && parameter.validators && parameter.validators.length > 0) {
                            _.forEach(parameter.validators, function (validator) {
                                if (utilities_1.Utilities.isFunction(validator)) {
                                    var testResult = validator(value);
                                    if (!testResult) {
                                        parameter.isValid = false;
                                    }
                                }
                            });
                            if (!parameter.isValid) {
                                _this.errors.push("Parameter " + parameter.name + " is invalid. Value failed custom validation check.");
                            }
                        }
                        if (!parameter.isValid) {
                            wasOneInvalid_1 = true;
                        }
                        else {
                            var newParam = Object.assign({}, parameter, { value: value });
                            _this.parameters.push(newParam);
                        }
                    });
                    _this.kyberServer.events.emit(events_1.KyberServerEvents.ExecutionContextAfterLoadParameters, {
                        source: "ExecutionContext.loadParameters",
                        correlationId: _this.correlationId,
                        schematic: _this.schematic.id,
                        parameters: Object.assign({}, _this.parameters)
                    });
                    if (wasOneInvalid_1) {
                        _this.httpStatus = 400;
                        throw new Error('Invalid Request');
                    }
                }
                resolve();
            }
            catch (err) {
                console.error("ExecutionContext.loadParameters: " + err);
                _this.errors.push("ExecutionContext.loadParameters: " + err);
                reject(err);
            }
        });
        return result;
    };
    ExecutionContext.prototype.errorResponse = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var test, task, response, err_5, test;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        test = {
                            class: responses_1.ErrorResponse
                        };
                        task = new responses_1.ErrorResponse(this, test);
                        return [4 /*yield*/, this.tryCatchWrapperForProcess(task, test)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, resolve(response.data || response)];
                    case 2:
                        err_5 = _a.sent();
                        test = Object.assign({}, {
                            httpStatus: this.httpStatus || 500,
                            errors: this.errors || ['Unknown Error'],
                            warnings: this.warnings || []
                        });
                        return [2 /*return*/, resolve(test)];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return result;
    };
    return ExecutionContext;
}());
exports.ExecutionContext = ExecutionContext;