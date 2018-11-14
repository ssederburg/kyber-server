import { RouteOptions } from './routes';
import { GlobalSchematic } from './schematics';
import { KyberServerOptions } from './kyberServerOptions';
import { RequestContext, SchematicResponse } from './schemas';
export declare class KyberServer {
    private options;
    private server;
    private isStarted;
    private shuttingDown;
    private globalSchematic;
    private sharedResources;
    events: any;
    constructor(options: KyberServerOptions);
    registerGlobalSchematic(schematic: typeof GlobalSchematic, sharedResources?: Array<any>): void;
    registerHandler(verb: string, path: string, handler: any): void;
    registerRoute(options: RouteOptions): void;
    start(): void;
    shutdown(): void;
    getGlobalSchematicResponse(httpStatus: number): SchematicResponse;
    throwGlobalSchematicError(req: RequestContext, httpStatus: number, errText: string): Promise<any>;
}
