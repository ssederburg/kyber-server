"use strict";
var KyberServerEvents;
(function (KyberServerEvents) {
    KyberServerEvents[KyberServerEvents["ServerStarting"] = 'server-starting'] = "ServerStarting";
    KyberServerEvents[KyberServerEvents["ServerStarted"] = 'server-started'] = "ServerStarted";
    KyberServerEvents[KyberServerEvents["ServerStopping"] = 'server-stopping'] = "ServerStopping";
    KyberServerEvents[KyberServerEvents["ServerStopped"] = 'server-stopped'] = "ServerStopped";
    KyberServerEvents[KyberServerEvents["GlobalSchematicError"] = 'global-schematic-error'] = "GlobalSchematicError";
    KyberServerEvents[KyberServerEvents["BeginRequest"] = 'begin-request'] = "BeginRequest";
    KyberServerEvents[KyberServerEvents["RouteHandlerException"] = 'route-handler-exception'] = "RouteHandlerException";
    KyberServerEvents[KyberServerEvents["ExecutionContextBeforeLoadParameters"] = 'execution-context-before-load-parameters'] = "ExecutionContextBeforeLoadParameters";
    KyberServerEvents[KyberServerEvents["ExecutionContextAfterLoadParameters"] = 'execution-context-after-load-parameters'] = "ExecutionContextAfterLoadParameters";
    KyberServerEvents[KyberServerEvents["ActivityStarted"] = 'activity-started'] = "ActivityStarted";
    KyberServerEvents[KyberServerEvents["ActivityEnded"] = 'activity-ended'] = "ActivityEnded";
    KyberServerEvents[KyberServerEvents["ProcessorStarted"] = 'processor-started'] = "ProcessorStarted";
    KyberServerEvents[KyberServerEvents["ProcessorEnded"] = 'processor-ended'] = "ProcessorEnded";
    KyberServerEvents[KyberServerEvents["EndRequest"] = 'end-request'] = "EndRequest";
})(KyberServerEvents = exports.KyberServerEvents || (exports.KyberServerEvents = {}));
