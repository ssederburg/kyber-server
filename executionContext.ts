import { Schematic } from './schematics'
import { RequestContext, Parameter, Activity, SharedResource, 
    ExecutionMode, ProcessorDef, BaseProcessor, ProcessorResponse, SchematicResponse } from './schemas'
import { Utilities } from './utilities/utilities'
import { KyberServerEvents } from './events'
import { KyberServer } from './kyberServer'

import * as _ from 'lodash'
import { RawResponse, ErrorResponse } from './responses';

export class ExecutionContext {

    public httpStatus: number = 200
    public correlationId: string = ''

    public errors = []
    public warnings = []
    public log = []
    
    public raw = {}
    public transformed = {}
    public mapped = {}

    public results = []

    private parameters: Array<Parameter> = []
    private wasOneCriticalFailure: boolean = false

    constructor(public req: RequestContext, public schematic: Schematic, private sharedResources: Array<SharedResource>, private kyberServer: KyberServer) { // KyberServer
        this.correlationId = req.id
    }

    public execute(): Promise<any> {

        const result = new Promise(async(resolve, reject) => {
            try {
                // Evaluate Input Parameters
                await this.loadParameters()
                await this.runActivities(this.schematic.activities)
                
                const response = await this.respond()
                return resolve(response)
            }
            catch (err) {
                if (!this.wasOneCriticalFailure) {
                    this.wasOneCriticalFailure = true
                    const response = await this.respond()
                    console.log(`executionContext.execute.error: Throwing ${JSON.stringify(response, null, 1)}`)
                    return reject(response)
                }
                const response = await this.errorResponse()
                console.log(`executionContext.execute.error.secondchance: Throwing ${JSON.stringify(response, null, 1)}`)
                return reject(response)
            }
        })

        return result
    }

    public getParameterValue(name: string): any {
        const theParamRecord = _.find(this.parameters, {name: name})
        if (!theParamRecord) return null
        return theParamRecord.value
    }

    public getSharedResource(name: string): any {
        const theTypeRecord = _.find(this.sharedResources, {name: name})
        if (!theTypeRecord) return null
        return theTypeRecord.instanceOfType
    }

    private runActivities(activities: Array<Activity>): Promise<any> {

        const result = new Promise((resolve, reject) => {
            try {
                if (!activities || activities.length <= 0) {
                    return resolve(true)
                }
                // TODO: To allow dynamic activity injection, use queue on Execution Context and shift completed items out
                const processTasks = []
                let counter = 0
                _.forEach(_.sortBy(activities, 'ordinal'), async(activityDef: Activity) => {
                    this.kyberServer.events.emit(KyberServerEvents.ActivityStarted, {
                        source: `ExecutionContext.runActivities`,
                        correlationId: this.correlationId,
                        schematic: this.schematic.id,
                        activity: activityDef.id
                    })
                    processTasks.push(this.runProcesses(activityDef.id, activityDef.processes, activityDef.executionMode))
                    // TODO: Track ProcessorResponse for httpStatus !== 200
                    await Promise.all(processTasks).then(async() => {
                        await this.runActivities(activityDef.activities)
                        counter = counter + 1
                        if (counter >= activities.length) {
                            this.kyberServer.events.emit(KyberServerEvents.ActivityEnded, {
                                source: `ExecutionContext.runActivities`,
                                correlationId: this.correlationId,
                                schematic: this.schematic.id,
                                activity: activityDef.id
                            })
                            return resolve(true)
                        }
                    }).catch((err) => {
                        console.log(`ExecutionContext.runActivities.error: ${JSON.stringify(err)}`)
                        this.errors.push(`ExecutionContext.runActvities.error: ${err.message}`)
                        this.httpStatus = err.httpStatus
                        return reject(err)
                    })
                })
            }
            catch (err) {
                return reject(err)
            }
        })

        return result

    }

    private runProcesses(activityId: string, processes: Array<ProcessorDef>, executionMode: ExecutionMode): Promise<any> {

        const result = new Promise(async(resolve, reject) => {
            try {
                if (!processes || processes.length <= 0) {
                    return resolve(true)
                }
                const tasks = []
                _.forEach(_.sortBy(processes, 'ordinal'), (process: ProcessorDef) => {
                    this.kyberServer.events.emit(KyberServerEvents.ProcessorStarted, {
                        source: `ExecutionContext.runProcesses`,
                        correlationId: this.correlationId,
                        schematic: this.schematic.id,
                        activity: activityId,
                        processor: process.class.name.toString()
                    })
                    // TODO: Load using Factory with name string
                    // TODO: Sequential vs. Concurrent
                    if (process.class && !process.className) {
                        const test = new process.class(this, process)
                        tasks.push(this.tryCatchWrapperForProcess(test, process).then((response) => {
                            this.kyberServer.events.emit(KyberServerEvents.ProcessorEnded, {
                                source: `ExecutionContext.runProcesses`,
                                correlationId: this.correlationId,
                                schematic: this.schematic.id,
                                activity: activityId,
                                processor: process.class.name.toString(),
                                response: Object.assign({}, response)
                            })
                        }))
                    }
                })
                const response = await Promise.all(tasks)
                // TODO: Check ProcessorResponse for httpStatus !== 200
                // TODO: Return a Processor Response consolidation
                if (response.indexOf(false) >= 0) {
                    return resolve(false)
                }
                return resolve(true)
            }
            catch (err) {
                console.log(`ExecutionContext.runProcesses.error: ${JSON.stringify(err, null, 1)}`)
                return reject(err)
            }
        })

        return result

    }

    private respond(): Promise<any> {

        const result = new Promise(async(resolve, reject) => {
            try {
                let theType: typeof BaseProcessor = null
                let test: SchematicResponse = _.find(this.schematic.responses, { httpStatus: this.httpStatus })
                if (!test) {
                    test = this.kyberServer.getGlobalSchematicResponse(this.httpStatus)
                    if (!test) {
                        console.log(`kyber-server.executionContext.respond.error: no record of response for http status ${this.httpStatus}`)
                        theType = RawResponse
                    } else {
                        theType = test.class
                    }
                } else {
                    // TODO: Implement resolve
                    theType = test.class
                }
                // TODO: Load from String using Factory
                const task = new theType(this, test)
                const response = await this.tryCatchWrapperForProcess(task, test)
                return resolve(response.data || response)
            }
            catch (err) {
                this.errors.push(`kyber-server.executionContext.respond().error`)
                return reject(err)
            }
        })

        return result

    }

    private tryCatchWrapperForProcess(processor: BaseProcessor, process: ProcessorDef): Promise<ProcessorResponse> {
        
        const result: Promise<ProcessorResponse> = new Promise(async(resolve, reject) => {
            try {
                const response = await processor.fx(process ? process.args : null)
                return resolve(response)
            }
            catch (err) {
                return reject(err)
            }
        })

        return result

    }

    private loadParameters(): Promise<any> {

        const result = new Promise((resolve, reject) => {
            try {
                let wasOneInvalid = false
                if (this.schematic && this.schematic.parameters && this.schematic.parameters.length > 0) {
                    this.kyberServer.events.emit(KyberServerEvents.ExecutionContextBeforeLoadParameters, {
                        source: `ExecutionContext.loadParameters`,
                        correlationId: this.correlationId,
                        schematic: this.schematic.id,
                        parameters: Object.assign({}, this.schematic.parameters)
                    })
                    _.forEach(this.schematic.parameters, (parameter: Parameter) => {
                        const value = Utilities.evalExpression(parameter.source, this.req)
                        parameter.isValid = true
                        // Is Required Validation
                        if (parameter.required && Utilities.isNullOrUndefined(value)) {
                            parameter.isValid = false
                            this.errors.push(`Parameter ${parameter.name} is required.`)
                        }
                        // Data Type Validation
                        if (value && parameter.dataType && parameter.isValid) {
                            parameter.isValid = Utilities.isDataType(value, parameter.dataType)
                            if (!parameter.isValid) {
                                this.errors.push(`Parameter ${parameter.name} is an invalid data type. Should be ${parameter.dataType}.`)
                            }
                        }
                        // White List Validation
                        if (value && parameter.isValid && parameter.whiteList && parameter.whiteList.length > 0) {
                            parameter.isValid = parameter.whiteList.indexOf(value) >= 0
                            if (!parameter.isValid) {
                                this.errors.push(`Parameter ${parameter.name} is invalid. Not in white list of values.`)
                            }
                        }
                        // Black List Validation
                        if (value && parameter.isValid && parameter.blackList && parameter.blackList.length > 0) {
                            parameter.isValid = parameter.blackList.indexOf(value) < 0
                            if (!parameter.isValid) {
                                this.errors.push(`Parameter ${parameter.name} is invalid. Value is in black list of values.`)
                            }
                        }
                        // Custom Validation
                        if (value && parameter.isValid && parameter.validators && parameter.validators.length > 0) {
                            _.forEach(parameter.validators, (validator) => {
                                if (Utilities.isFunction(validator)) {
                                    const testResult = validator(value)
                                    if (!testResult) {
                                        parameter.isValid = false
                                    }
                                }
                                // TODO: Validator Factory from ClassName
                            })
                            if (!parameter.isValid) {
                                this.errors.push(`Parameter ${parameter.name} is invalid. Value failed custom validation check.`)
                            }
                        }
                        if (!parameter.isValid) {
                            wasOneInvalid = true
                        } else {
                            const newParam = Object.assign({}, parameter, {value: value})
                            this.parameters.push(newParam)
                        }
                    })
                    this.kyberServer.events.emit(KyberServerEvents.ExecutionContextAfterLoadParameters, {
                        source: `ExecutionContext.loadParameters`,
                        correlationId: this.correlationId,
                        schematic: this.schematic.id,
                        parameters: Object.assign({}, this.parameters)
                    })
                    if (wasOneInvalid) {
                        this.httpStatus = 400
                        throw new Error('Invalid Request')
                    }
                }
                resolve()
            }
            catch (err) {
                console.error(`ExecutionContext.loadParameters: ${err}`)
                this.errors.push(`ExecutionContext.loadParameters: ${err}`)
                reject(err)
            }
        })

        return result

    }

    private errorResponse(): Promise<any> {

        const result = new Promise(async(resolve, reject) => {
            try {
                const test = {
                    class: ErrorResponse
                }
                const task = new ErrorResponse(this, test)
                const response = await this.tryCatchWrapperForProcess(task, test)
                return resolve(response.data || response)
            }
            catch (err) {
                const test = Object.assign({}, {
                    httpStatus: this.httpStatus || 500,
                    errors: this.errors || ['Unknown Error'],
                    warnings: this.warnings || []
                })
                return resolve(test)
            }
        })

        return result

    }
}