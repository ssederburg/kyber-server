import * as Express from 'express'
import { Schematic } from "..";

export class RouteHandler {

    public static get(server: Express.Application, path: string, schematic: Schematic) {

        server.get(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called GET at ${path}`

            res.json(output)

            return next()
        })
    
    }

    public static post(server: Express.Application, path: string, schematic: Schematic) {

        server.post(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called POST at ${path}`

            res.json(output)

            return next()
        })
    
    }

    public static put(server: Express.Application, path: string, schematic: Schematic) {

        server.put(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called PUT at ${path}`

            res.json(output)

            return next()
        })
    
    }

    public static delete(server: Express.Application, path: string, schematic: Schematic) {

        server.delete(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called DELETE at ${path}`

            res.json(output)

            return next()
        })
    
    }

    public static patch(server: Express.Application, path: string, schematic: Schematic) {

        server.patch(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called PATCH at ${path}`

            res.json(output)

            return next()
        })
    
    }

    public static all(server: Express.Application, path: string, schematic: Schematic) {

        server.all(path, (req, res, next) => {
            res.set('X-Powered-By', 'Kyber')
            return next()
        })

    }

}