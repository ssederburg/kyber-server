export var KyberServerEvents;
(function (KyberServerEvents) {
    KyberServerEvents["ServerStarting"] = "server-starting";
    KyberServerEvents["ServerStarted"] = "server-started";
    KyberServerEvents["ServerStopping"] = "server-stopping";
    KyberServerEvents["ServerStopped"] = "server-stopped";
    KyberServerEvents["GlobalSchematicError"] = "global-schematic-error";
    KyberServerEvents["BeginRequest"] = "begin-request";
    KyberServerEvents["RouteHandlerException"] = "route-handler-exception";
    KyberServerEvents["ExecutionContextBeforeLoadParameters"] = "execution-context-before-load-parameters";
    KyberServerEvents["ExecutionContextAfterLoadParameters"] = "execution-context-after-load-parameters";
    KyberServerEvents["ActivityStarted"] = "activity-started";
    KyberServerEvents["ActivityEnded"] = "activity-ended";
    KyberServerEvents["ProcessorStarted"] = "processor-started";
    KyberServerEvents["ProcessorEnded"] = "processor-ended";
    KyberServerEvents["EndRequest"] = "end-request";
})(KyberServerEvents || (KyberServerEvents = {}));
