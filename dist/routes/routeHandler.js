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
var executionContext_1 = require("../executionContext");
var utilities_1 = require("../utilities/utilities");
var events_1 = require("../events");
var RouteHandler = (function () {
    function RouteHandler(kyberServer) {
        this.kyberServer = kyberServer;
    }
    RouteHandler.prototype.register = function (server, options) {
        var _this = this;
        if (!options.verb) {
            console.warn("Attempted to register route @" + options.path + " contained null verb. Route ignored...");
            return;
        }
        options.verb = options.verb.toLowerCase();
        if (!server[options.verb]) {
            console.warn("Attempted to register route @" + options.path + " for unrecognized verb " + options.verb + ". Route ignored...");
            return;
        }
        server[options.verb](options.path, function (req, res, next) {
            var requestContext = req;
            return _this.execute(server, options, requestContext, res, next);
        });
    };
    RouteHandler.prototype.execute = function (server, options, req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var testResult, response, execContext, schematicInstance, timer, result, err_1, httpStatus_1, endTime, runtime, message, httpStatus, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(options.useResolver && options.resolve))
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, options.resolve(req)];
                    case 1:
                        testResult = _a.sent();
                        if (testResult) {
                            options.schematic = testResult;
                        }
                        _a.label = 2;
                    case 2:
                        if (!!options.schematic)
                            return [3 /*break*/, 4];
                        console.log("Attempted to execute route " + req.path + " without a valid schematic. Route ignored.");
                        return [4 /*yield*/, this.throwError(req, 400, "Invalid Request. Missing Schematic.", options, next)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, res.status(400).json(response)];
                    case 4:
                        _a.trys.push([4, 7, , 9]);
                        schematicInstance = new options.schematic();
                        timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var response;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (res.headersSent)
                                            return [2 /*return*/];
                                        console.log("Timeout exceeded on path " + req.path);
                                        req.timedout = true;
                                        return [4 /*yield*/, this.throwError(req, 400, "Request Timed Out.", options, next)];
                                    case 1:
                                        response = _a.sent();
                                        return [2 /*return*/, res.status(408).json(response)];
                                }
                            });
                        }); }, schematicInstance.timeout || 5000);
                        execContext = new executionContext_1.ExecutionContext(req, schematicInstance, options.sharedResources || [], this.kyberServer);
                        if (req.timedout)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.beforeEachExecution(server, options, req, res)];
                    case 5:
                        _a.sent();
                        if (req.timedout)
                            return [2 /*return*/];
                        return [4 /*yield*/, execContext.execute()];
                    case 6:
                        result = _a.sent();
                        res.status(execContext.httpStatus).json(result);
                        clearTimeout(timer);
                        if (req.timedout)
                            return [2 /*return*/];
                        this.afterEachExecution(server, options, req, res, next);
                        return [3 /*break*/, 9];
                    case 7:
                        err_1 = _a.sent();
                        if (res.headersSent)
                            return [2 /*return*/];
                        if (!utilities_1.Utilities.isString(err_1)) {
                            httpStatus_1 = execContext.httpStatus === 200 ? 500 : execContext.httpStatus;
                            endTime = new Date();
                            runtime = Math.abs(+endTime - +req.starttime) / 1000;
                            this.kyberServer.events.emit(events_1.KyberServerEvents.RouteHandlerException, {
                                source: "RouteHandler.execute.catch",
                                correlationId: req.id,
                                body: req.body,
                                method: req.method,
                                params: req.params,
                                path: req.path,
                                query: req.query,
                                err: Object.assign({}, err_1),
                                httpStatus: httpStatus_1,
                                starttime: req.starttime,
                                endtime: endTime,
                                runtime: runtime,
                                ip: req.ip
                            });
                            return [2 /*return*/, res.status(httpStatus_1).json(err_1)];
                        }
                        message = err_1;
                        httpStatus = message.indexOf('timeout') >= 0 ? 408 : execContext.httpStatus;
                        if (httpStatus === 200)
                            httpStatus = 500;
                        return [4 /*yield*/, this.throwError(req, httpStatus, message, options, next)];
                    case 8:
                        response = _a.sent();
                        return [2 /*return*/, res.status(httpStatus).json(response)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    RouteHandler.prototype.beforeEachExecution = function (server, options, req, res) {
        res.header('X-Powered-By', 'kyber');
        var startTime = new Date();
        req.starttime = startTime;
        this.kyberServer.events.emit(events_1.KyberServerEvents.BeginRequest, {
            source: "RouteHandler.beforeEachExecution",
            correlationId: req.id,
            body: req.body,
            method: req.method,
            params: req.params,
            path: req.path,
            query: req.query,
            starttime: startTime,
            ip: req.ip
        });
        return Promise.resolve(true);
    };
    RouteHandler.prototype.afterEachExecution = function (server, options, req, res, next) {
        var endTime = new Date();
        var runtime = Math.abs(+endTime - +req.starttime) / 1000;
        this.kyberServer.events.emit(events_1.KyberServerEvents.EndRequest, {
            source: "RouteHandler.afterEachExecution",
            correlationId: req.id,
            body: req.body,
            method: req.method,
            params: req.params,
            path: req.path,
            query: req.query,
            starttime: req.starttime,
            endtime: endTime,
            runtime: runtime,
            ip: req.ip
        });
        if (!res.headersSent) {
            next();
            return Promise.resolve(true);
        }
        return Promise.resolve(true);
    };
    RouteHandler.prototype.throwError = function (req, httpStatus, message, options, next) {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.kyberServer.throwGlobalSchematicError(req, httpStatus, message)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, resolve(response)];
                    case 2:
                        err_2 = _a.sent();
                        return [2 /*return*/, next(err_2)];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return result;
    };
    return RouteHandler;
}());
exports.RouteHandler = RouteHandler;