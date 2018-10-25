import * as Express from 'express'
import { Schematic, RequestContext } from "..";
import { RouteOptions } from './'
import * as config from 'config'
import { ExecutionContext } from '../executionContext';

export class RouteHandler {

    //#region Server Method Implementation
    public register(server: Express.Application, options: RouteOptions) {
        if (!options.verb) {
            console.warn(`Attempted to register route @${options.path} contained null verb. Route ignored...`)
            return
        }

        options.verb = options.verb.toLowerCase()
        if (!server[options.verb]) {
            console.warn(`Attempted to register route @${options.path} for unrecognized verb ${options.verb}. Route ignored...`)
            return
        }

        server[options.verb](options.path, (req, res, next) => {
            const requestContext: RequestContext = req
            return this.execute(server, options, requestContext, res, next)
        })

    }
    //#endregion

    private async execute(server: Express.Application, options: RouteOptions, req: RequestContext, res: Express.Response, 
        next: Express.NextFunction) {

        // Check if resolver. If so, run it before continuing
        if (options.useResolver && options.resolve) {
            const testResult:Promise<Schematic>|Schematic|null = await options.resolve(req)
            if (testResult) {
                options.schematic = testResult
            }
        }
        if (!options.schematic) {
            console.log(`Attempted to execute route ${req.path} without a valid schematic. Route ignored.`)
            // TODO: Common Error Handling Default Response from Kyber
            res.status(400).send({
                httpStatus: 400,
                message: 'Invalid Request. Missing schematic.'
            })
            return
        }

        const execContext: ExecutionContext = new ExecutionContext(req, options.schematic)

        await this.beforeEachRun(server, options, req, res)
        // How to return an error from here - return next({httpStatus: 500, message: 'Did not work'})
        // If returning an error in JSON, make sure header for JSON is set

        const result = await execContext.execute()
        res.json(result)


        // No need to "await" response from afterRun call because response has already been sent to caller.
        this.afterEachRun(server, options, req, res, next)

    }

    private beforeEachRun(server: Express.Application, options: RouteOptions, 
        req: RequestContext, res: Express.Response): Promise<any> {

        res.header('X-Powered-By', 'kyber')
        return Promise.resolve(true)

    }

    private afterEachRun(server: Express.Application, options: RouteOptions, 
        req: RequestContext, res: Express.Response,
        next: Express.NextFunction): Promise<any> {

        if (!res.headersSent) {
            next()
            return Promise.resolve(true)
        }
        return Promise.resolve(true)

    }
}