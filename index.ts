const http = require('http')
const router = require('find-my-way')()
const EventEmitter = require('events')

export class KyberServer {

    private server
    private isStarted: boolean = false

    public events = new EventEmitter()

    constructor () {

        //router.on('GET', '/', (req, res, params) => {
        //    res.end('{"message":"hello world"}')
        //})

    }

    start() {

        if (this.isStarted) return
        this.isStarted = true

        this.events.emit('starting')
        this.server = http.createServer((req, res) => {
            router.lookup(req, res)
        })
        
        this.server.listen(3000, err => {
            if (err) throw err

            process.on('SIGTERM', () => {
                console.log('\nSIGTERM signal received. Shutting down server...\n')
                this.shutdown()
            })

            process.on('exit', () => {
                console.log('\nEXIT signal received. Shutting down server...\n')
                this.shutdown()
            })

            process.on('SIGINT', () => {
                console.log('\nSIGINT signal received. Shutting down server...\n')
                this.shutdown()
            })

            this.events.emit('started', {
                status: 0,
                message: 'Hello There'
            })
            console.log('\nServer listening on http://localhost:3000\n')
        })

    }

    shutdown() {

        this.events.emit('stopping')
        this.server.close()
        this.events.emit('stopped')
        process.exit(0)

    }
}
