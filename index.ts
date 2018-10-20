const express = require('express')
const EventEmitter = require('events')

import {KyberServerEvents} from './events'
import {RouteHandler} from './routes'
import {Schematic} from './schematics'
import {KyberServerOptions} from './'
import * as _ from 'lodash'

export class KyberServer {

    private server = express()
    private isStarted: boolean = false
    private shuttingDown: boolean = false
    private options: KyberServerOptions = new KyberServerOptions()

    public events = new EventEmitter()

    constructor (options: KyberServerOptions) {

        this.options = _.cloneDeep(options)

    }

    public registerRoute(verb: string, path: string, schematic: Schematic, contentType?: string) {
        
        if (this.isStarted) {
            console.error(`Attempted to KyberServer.registerRoute after server started. Route Registration ignored...`)
            return
        }
        RouteHandler.all(this.server, path, schematic)

        switch (verb.toLowerCase()) {
            case "get":
                RouteHandler.get(this.server, path, schematic)
                break;
            case "post":
                RouteHandler.post(this.server, path, schematic)
                break;
            case "put":
                RouteHandler.put(this.server, path, schematic)
                break;
            case "delete":
                RouteHandler.delete(this.server, path, schematic)
                break;
            case "patch":
                RouteHandler.patch(this.server, path, schematic)
            default:
                break;
        }

    }

    public start() {

        if (this.isStarted) return
        this.isStarted = true

        this.events.emit('starting')
        
        this.server.use((err, req, res, next) => {
            if (err) {
                // TODO: Custom Error handler
                return next(err)
            }
            next(err)
        })

        this.server.use((req, res, next) => {
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
        this.server.close()
        this.events.emit(KyberServerEvents.ServerStopped)
        process.exit(0)

    }
}

export * from './events'
export * from './schematics'
export * from './kyberServerOptions'
