import * as Express from 'express';
import { RouteOptions } from './';
export declare class RouteHandler {
    private kyberServer;
    constructor(kyberServer: any);
    register(server: Express.Application, options: RouteOptions): void;
    private execute;
    private beforeEachExecution;
    private afterEachExecution;
    private throwError;
}
