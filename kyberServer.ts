import * as Express from 'express'

const express = require('express')
const bodyParser = require('body-parser')
const EventEmitter = require('events')

import {KyberServerEvents} from './events'
import {RouteHandler, RouteOptions} from './routes'
import {Schematic, GlobalSchematic} from './schematics'
import {KyberServerOptions} from './'
import * as _ from 'lodash'
const env = require("dotenv").config()
import * as config from 'config'
import { RequestContext, SchematicResponse } from './schemas';
import { ExecutionContext } from './executionContext';
const uuidv4 = require('uuid/v4')

export class KyberServer {

    private server = express()
    private isStarted: boolean = false
    private shuttingDown: boolean = false
    private globalSchematic: typeof GlobalSchematic = null
    private sharedResources: Array<any> = []
    
    public events = new EventEmitter()

    constructor (private options: KyberServerOptions) {
        this.server.use(bodyParser.json())
        this.server.use((req, res, next) => {
            req.id = uuidv4()
            return next()
        })
    }

    public registerGlobalSchematic(schematic: typeof GlobalSchematic, sharedResources: Array<any> = []) {
        this.globalSchematic = schematic
        this.sharedResources = sharedResources
    }

    public registerHandler(verb: string, path: string, handler: any) {
        if (!this.server[verb]) {
            console.warn(`Attempted to Register Handler for verb ${verb} @ ${path}. Unknown verb. Handler registration ignored...`)
            return
        }

        this.server[verb](path, (req: RequestContext, res: Express.Response, next: Express.NextFunction) => {
            return handler(req, res, next)
        })
    }

    public registerRoute(options: RouteOptions) {
        
        if (this.isStarted) {
            console.error(`Attempted to KyberServer.registerRoute after server started. Route Registration ignored...`)
            return
        }

        const routeHandler = new RouteHandler(this)
        routeHandler.register(this.server, options)

    }

    public start() {

        if (this.isStarted) return
        this.isStarted = true

        this.events.emit(KyberServerEvents.ServerStarting, {
            source: `KyberServer`,
            correlationId: `SYSTEM`
        })
        
        this.server.use(async(err, req, res, next) => {
            if (err) {
                console.log('500: ' + err)
                if (res.headersSent) {
                    return
                }
                res.header('X-Powered-By', 'kyber')
                const response = await this.throwGlobalSchematicError(req, 500, `Unhandled Exception in service: ${req.path}: ${err}`)
                return res.status(500).json(response)
            }
            next(err)
        })

        this.server.use(async(req, res, next) => {
            res.header('X-Powered-By', 'kyber')
            const response = await this.throwGlobalSchematicError(req, 404, `Unable to locate path ${req.path}`)
            return res.status(404).json(response)
        })

        this.server.listen(this.options.port, err => {
            if (err) throw err

            process.on('SIGTERM', () => {
                this.shutdown()
            })

            process.on('exit', () => {
                this.shutdown()
            })

            process.on('SIGINT', () => {
                this.shutdown()
            })

            this.events.emit(KyberServerEvents.ServerStarted, {
                source: `KyberServer`,
                correlationId: `SYSTEM`,
                status: 0,
                message: 'Hello There'
            })
            console.log(`\nServer listening on http://localhost:${this.options.port}\n`)
        })

    }

    public shutdown() {

        if (this.shuttingDown) return
        this.shuttingDown = true

        this.events.emit(KyberServerEvents.ServerStopping, {
            source: `KyberServer`,
            correlationId: `SYSTEM`
        })
        
        // TODO: Call Shutdown on all routes
        this.events.emit(KyberServerEvents.ServerStopped, {
            source: `KyberServer`,
            correlationId: `SYSTEM`
        })
        process.exit(0)

    }

    public getGlobalSchematicResponse(httpStatus: number): SchematicResponse {

        if (!this.globalSchematic) return null
        const global = new this.globalSchematic()
        const test = _.find(global.responses, { httpStatus: httpStatus })
        if (test) {
            return test
        }
        // Finally Search for default wildcard of 0
        const lastChance = _.find(global.responses, { httpStatus: 0 })
        if (lastChance) {
            return lastChance
        }
        return null

    }

    public throwGlobalSchematicError(req: RequestContext, httpStatus: number, errText: string): Promise<any> {

        const result = new Promise(async(resolve, reject) => {
            try {
                const executionContext = new ExecutionContext(req, new this.globalSchematic(), this.sharedResources, this)
                executionContext.httpStatus = httpStatus
                executionContext.raw = errText
                executionContext.errors.push(errText)
                const response = await executionContext.execute()
                this.events.emit(KyberServerEvents.GlobalSchematicError, {
                    source: `KyberServer.throwGlobalSchematicError`,
                    correlationId: req.id,
                    path: req.path,
                    method: req.method,
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    httpStatus: httpStatus,
                    message: errText
                })
                return resolve(response)
            }
            catch (err) {
                // TODO: What do we do with rejections from GlobalExecutionContext execution?
                return resolve()
            }    
        })

        return result

    }
}

