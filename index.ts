import * as Express from 'express'

const express = require('express')
const bodyParser = require('body-parser')
const EventEmitter = require('events')

import {KyberServerEvents} from './events'
import {RouteHandler, RouteOptions} from './routes'
import {Schematic} from './schematics'
import {KyberServerOptions} from './'
import * as _ from 'lodash'
const env = require("dotenv").config()
import * as config from 'config'
import { RequestContext, BaseProcessor } from './schemas';
import { ExecutionContext } from './executionContext';

export class KyberServer {

    private server = express()
    private isStarted: boolean = false
    private shuttingDown: boolean = false
    
    public events = new EventEmitter()

    constructor (private options: KyberServerOptions) {
        this.server.use(bodyParser.json())
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

        const routeHandler = new RouteHandler()
        routeHandler.register(this.server, options)

    }

    public start() {

        if (this.isStarted) return
        this.isStarted = true

        this.events.emit('starting')
        
        this.server.use((err, req, res, next) => {
            if (err) {
                // TODO: Custom Error handler
                console.log('500: ' + err)
                if (res.headersSent) {
                    return
                }
                res.status(500)
                res.send(err)
                return
            }
            console.log('400')
            next(err)
        })

        this.server.use((req, res, next) => {
            // TODO: Handle 404 Errors
            console.log('404')
            return res.status(404).send()
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
                status: 0,
                message: 'Hello There'
            })
            console.log(`\nServer listening on http://localhost:${this.options.port}\n`)
        })

    }

    public shutdown() {

        if (this.shuttingDown) return
        this.shuttingDown = true

        this.events.emit(KyberServerEvents.ServerStopping)
        
        // TODO: Call Shutdown on all routes
        this.events.emit(KyberServerEvents.ServerStopped)
        process.exit(0)

    }
}

export { KyberServerEvents} from './events'
export { Schematic } from './schematics'
export { KyberServerOptions } from './kyberServerOptions'
export { RouteOptions } from './routes'
export { RequestContext, IUserContext, Parameter, ComposerDefSchema, 
    Activity, SharedResourceSchema, ExecutionMode } from './schemas'
export { BaseComposer } from './composers'
export { ExecutionContext } from './executionContext'
export { Utilities } from './utilities/utilities'
export { StartsWith, StartsWithAny, EndsWith, EndsWithAny, Length, MinLength, MaxLength,
    Range, Min, Max, MinDate, MaxDate, IsFloat, IsObject, IsArray, Contains, ContainsAny } from './validators'
