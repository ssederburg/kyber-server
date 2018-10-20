import * as Express from 'express'
import { Schematic } from "..";
import * as config from 'config'

export class RouteHandler {

    public static get(server: Express.Application, path: string, schematic: Schematic) {

        server.get(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called GET at ${path}`

            res.json(output)

        })
    
    }

    public static post(server: Express.Application, path: string, schematic: Schematic) {

        server.post(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called POST at ${path} ${process.env.TESTTEXT} ${config.port}`

            res.json(output)

        })
    
    }

    public static put(server: Express.Application, path: string, schematic: Schematic) {

        server.put(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called PUT at ${path}`

            res.json(output)

        })
    
    }

    public static delete(server: Express.Application, path: string, schematic: Schematic) {

        server.delete(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called DELETE at ${path}`

            res.json(output)

        })
    
    }

    public static patch(server: Express.Application, path: string, schematic: Schematic) {

        server.patch(path, (req, res, next) => {
            const output: any = schematic
            output.message = `called PATCH at ${path}`
            throw new Error('This didnt work!')
            // res.json(output)

        })
    
    }

    public static all(server: Express.Application, path: string, schematic: Schematic) {

        server.all(path, (req, res, next) => {
            res.set('X-Powered-By', 'Kyber')
            return next()
        })

    }

}