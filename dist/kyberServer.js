"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
var env = require("dotenv").config();
if (process.env.APPDYNAMICS_HOSTNAME) {
    console.log("Standing up AppDynamics interface for node process as " + process.env.APPDYNAMICS_NODENAME + " on " + process.env.APPDYNAMICS_TIERNAME);
    require('appdynamics').profile({
        controllerHostName: process.env.APPDYNAMICS_HOSTNAME,
        controllerPort: process.env.APPDYNAMICS_PORT,
        controllerSslEnabled: process.env.APPDYNAMICS_SSLENABLED,
        accountName: process.env.APPDYNAMICS_ACCOUNTNAME,
        accountAccessKey: process.env.APPDYNAMICS_ACCOUNTKEY,
        applicationName: process.env.APPDYNAMICS_APPNAME,
        tierName: process.env.APPDYNAMICS_TIERNAME,
        nodeName: process.env.APPDYNAMICS_NODENAME
    });
}
var express = require('express');
var helmet = require('helmet');
var bodyParser = require('body-parser');
var EventEmitter = require('events');
var events_1 = require("./events");
var routes_1 = require("./routes");
var _ = require("lodash");
var executionContext_1 = require("./executionContext");
var uuidv4 = require('uuid/v4');
var swaggerUi = require('swagger-ui-express');
var KyberServer = (function () {
    function KyberServer(options) {
        this.options = options;
        this.server = null;
        this.isStarted = false;
        this.shuttingDown = false;
        this.globalSchematic = null;
        this.sharedResources = [];
        this.events = new EventEmitter();
        this.server = express();
        this.server.use(helmet());
        this.server.use(bodyParser.json());
        this.server.use(function (req, res, next) {
            req.id = uuidv4();
            return next();
        });
    }
    KyberServer.prototype.registerGlobalSchematic = function (schematic, sharedResources) {
        if (sharedResources === void 0) { sharedResources = []; }
        this.globalSchematic = schematic;
        this.sharedResources = sharedResources;
    };
    KyberServer.prototype.registerHandler = function (verb, path, handler) {
        if (!this.server[verb]) {
            console.warn("Attempted to Register Handler for verb " + verb + " @ " + path + ". Unknown verb. Handler registration ignored...");
            return;
        }
        this.server[verb](path, function (req, res, next) {
            return handler(req, res, next);
        });
    };
    KyberServer.prototype.registerRoute = function (options) {
        if (this.isStarted) {
            console.error("Attempted to KyberServer.registerRoute after server started. Route Registration ignored...");
            return;
        }
        var routeHandler = new routes_1.RouteHandler(this);
        routeHandler.register(this.server, options);
    };
    KyberServer.prototype.start = function () {
        var _this = this;
        if (this.isStarted)
            return;
        this.isStarted = true;
        this.events.emit(events_1.KyberServerEvents.ServerStarting, {
            source: "KyberServer",
            correlationId: "SYSTEM"
        });
        if (this.options.staticPath) {
            if (this.options.baseHref) {
                this.server.use(this.options.baseHref, express.static(this.options.staticPath));
            }
            else {
                this.server.use(express.static(this.options.staticPath));
            }
        }
        console.log("Loading swagger from " + (process.cwd() + '/swagger.json'));
        var swaggerDocument = require(process.cwd() + '/swagger.json');
        this.server.use('/swagger.io', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        this.server.use(function (err, req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!err) return [3, 2];
                        if (res.headersSent) {
                            return [2];
                        }
                        return [4, this.throwGlobalSchematicError(req, 500, "Unhandled Exception in service: " + req.path + ": " + err)];
                    case 1:
                        response = _a.sent();
                        return [2, res.status(500).json(response)];
                    case 2:
                        next(err);
                        return [2];
                }
            });
        }); });
        this.server.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.options.staticPath && !req.XHR) {
                        }
                        return [4, this.throwGlobalSchematicError(req, 404, "Unable to locate path " + req.path)];
                    case 1:
                        response = _a.sent();
                        return [2, res.status(404).json(response)];
                }
            });
        }); });
        this.server.listen(this.options.port, function (err) {
            if (err)
                throw err;
            process.on('SIGTERM', function () {
                _this.shutdown();
            });
            process.on('exit', function () {
                _this.shutdown();
            });
            process.on('SIGINT', function () {
                _this.shutdown();
            });
            process.on('uncaughtException', function (err) {
                console.error("UncaughtException in KyberServer");
                console.error(JSON.stringify(err, null, 1));
                _this.shutdown(true);
            });
            _this.events.emit(events_1.KyberServerEvents.ServerStarted, {
                source: "KyberServer",
                correlationId: "SYSTEM",
                status: 0,
                message: 'Locked In'
            });
            console.log("\nServer listening on http://localhost:" + _this.options.port + "\n");
        });
    };
    KyberServer.prototype.shutdown = function (withError) {
        if (withError === void 0) { withError = false; }
        if (this.shuttingDown)
            return;
        this.shuttingDown = true;
        this.events.emit(events_1.KyberServerEvents.ServerStopping, {
            source: "KyberServer",
            correlationId: "SYSTEM"
        });
        this.events.emit(events_1.KyberServerEvents.ServerStopped, {
            source: "KyberServer",
            correlationId: "SYSTEM"
        });
        process.exit(withError ? 1 : 0);
    };
    KyberServer.prototype.getGlobalSchematicResponse = function (httpStatus) {
        if (!this.globalSchematic)
            return null;
        var global = new this.globalSchematic();
        var test = _.find(global.responses, { httpStatus: httpStatus });
        if (test) {
            return test;
        }
        var lastChance = _.find(global.responses, { httpStatus: 0 });
        if (lastChance) {
            return lastChance;
        }
        return null;
    };
    KyberServer.prototype.throwGlobalSchematicError = function (req, httpStatus, errText) {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var executionContext, response, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        executionContext = new executionContext_1.ExecutionContext(req, new this.globalSchematic(), this.sharedResources, this);
                        executionContext.httpStatus = httpStatus;
                        executionContext.raw = errText;
                        executionContext.errors.push(errText);
                        return [4, executionContext.execute()];
                    case 1:
                        response = _a.sent();
                        this.events.emit(events_1.KyberServerEvents.GlobalSchematicError, {
                            source: "KyberServer.throwGlobalSchematicError",
                            correlationId: req.id,
                            path: req.path,
                            method: req.method,
                            body: req.body,
                            params: req.params,
                            query: req.query,
                            httpStatus: httpStatus,
                            message: errText
                        });
                        return [2, resolve(response)];
                    case 2:
                        err_1 = _a.sent();
                        return [2, resolve()];
                    case 3: return [2];
                }
            });
        }); });
        return result;
    };
    return KyberServer;
}());
exports.KyberServer = KyberServer;
