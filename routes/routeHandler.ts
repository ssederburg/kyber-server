import * as Express from 'express'
import { Schematic, RequestContext } from "..";
import { RouteOptions } from './'
import * as config from 'config'
import { ExecutionContext } from '../executionContext';
import { Utilities } from '../utilities/utilities';

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

    private async execute(server: Express.Application, options: RouteOptions,
        req: RequestContext, res: Express.Response, 
        next: Express.NextFunction) {

        // Check if resolver. If so, run it before continuing
        if (options.useResolver && options.resolve) {
            const testResult:Promise<typeof Schematic>|typeof Schematic|null = await options.resolve(req)
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

        let execContext: ExecutionContext;
        try {
            
            const schematicInstance = new options.schematic()
            const timer = setTimeout(() => {
                if (res.headersSent) return
                console.log(`Timeout exceeded`)
                req.timedout = true
                res.status(408).json('Request timeout')
                return
            }, schematicInstance.timeout || 5000)

            execContext = new ExecutionContext(req, schematicInstance, options.sharedResources||[])

            if (req.timedout) return
            await this.beforeEachExecution(server, options, req, res)
            // How to return an error from here - return next({httpStatus: 500, message: 'Did not work'})
            // If returning an error in JSON, make sure header for JSON is set
    
            if (req.timedout) return
            const result = await execContext.execute()
            res.status(execContext.httpStatus).json(result)
            
            clearTimeout(timer)

            // No need to "await" response from afterRun call because response has already been sent to caller.
            if (req.timedout) return
            this.afterEachExecution(server, options, req, res, next)    

        }
        catch (err) {
            // TODO: ERROR RESPONSE FROM SCHEMATIC
            if (res.headersSent) return
            if (Utilities.isString(err)) {
                if (err.indexOf('timeout') >= 0) {
                    return res.status(408).json(err)
                }
            }
            res.status(execContext.httpStatus).json(err)
        }

    }

    private beforeEachExecution(server: Express.Application, options: RouteOptions, 
        req: RequestContext, res: Express.Response): Promise<any> {

        res.header('X-Powered-By', 'kyber')
        return Promise.resolve(true)

    }

    private afterEachExecution(server: Express.Application, options: RouteOptions, 
        req: RequestContext, res: Express.Response,
        next: Express.NextFunction): Promise<any> {

        if (!res.headersSent) {
            next()
            return Promise.resolve(true)
        }
        return Promise.resolve(true)

    }
}