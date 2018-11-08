import * as Express from 'express'
import { Schematic, RequestContext, KyberServer } from "..";
import { RouteOptions } from './'
import * as config from 'config'
import { ExecutionContext } from '../executionContext';
import { Utilities } from '../utilities/utilities';

import * as _ from 'lodash'

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
            const response = await this.throwError(req, 400, `Invalid Request. Missing Schematic.`, options, next)
            return res.status(400).json(response)
        }

        let execContext: ExecutionContext;
        try {
            
            const schematicInstance = new options.schematic()
            const timer = setTimeout(async() => {
                if (res.headersSent) return
                console.log(`Timeout exceeded on path ${req.path}`)
                req.timedout = true
                const response = await this.throwError(req, 400, `Request Timed Out.`, options, next)
                return res.status(408).json(response)
            }, schematicInstance.timeout || 5000)

            execContext = new ExecutionContext(req, schematicInstance, options.sharedResources||[])

            if (req.timedout) return
            await this.beforeEachExecution(server, options, req, res)
            // How to return an error from here - return next('Did not work')
            
            if (req.timedout) return
            const result = await execContext.execute()
            res.status(execContext.httpStatus).json(result)
            
            clearTimeout(timer)

            // No need to "await" response from afterRun call because response has already been sent to caller.
            if (req.timedout) return
            this.afterEachExecution(server, options, req, res, next)    

        }
        catch (err) {
            if (res.headersSent) return
            if (!Utilities.isString(err)) {
                // The Error Response has already been composed by Execution Context
                const httpStatus = execContext.httpStatus === 200 ? 500 : execContext.httpStatus
                return res.status(httpStatus).json(err)
            }
            let message = err
            let httpStatus = message.indexOf('timeout') >= 0 ? 408 : execContext.httpStatus
            // We assumed the httpStatus was changed because of an error. But in case it still says OK, make it INTERNAL SERVER ERROR
            if (httpStatus === 200) httpStatus = 500
            const response = await this.throwError(req, httpStatus, message, options, next)
            return res.status(httpStatus).json(response)
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

    private throwError(req: RequestContext, httpStatus: number, message: string, options: RouteOptions, next: Express.NextFunction): Promise<any> {

        const result = new Promise(async(resolve, reject) => {
            try {
                const kyberServerTest = _.find(options.sharedResources, { name: 'kyberServer' })
                if (!kyberServerTest) {
                    return next(message)
                }
                const response = await kyberServerTest.instanceOfType.throwGlobalSchematicError(req, httpStatus, message)
                return resolve(response)
            }
            catch (err) {
                return next(err)
            }
        })

        return result

    }
}