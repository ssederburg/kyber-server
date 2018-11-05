import { Schematic } from '../schematics'

export class RouteOptions {
    verb: string = 'GET'
    path: string = ''
    schematic?: typeof Schematic = null
    contentType?: string = 'application/json'
    useResolver?: boolean = false
    sharedResources?: Array<any> = []
    
    public resolve?(req: Express.Request|any): Promise<typeof Schematic>|typeof Schematic|null {
        return null
    }

}
