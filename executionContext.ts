import { Schematic } from './schematics'
import { RequestContext } from './schemas'

export class ExecutionContext {

    constructor(private req: RequestContext, private schematic: Schematic) {
    }

    public execute(): Promise<any> {
        return Promise.resolve({
            verb: this.req.method,
            path: this.req.path,
            schematic: this.schematic,
            before: this.req.body.before,
            executionContext: 'Says Hi',
            user: this.req.user
        })
    }

}