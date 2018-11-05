import { ProcessorDef, ExecutionMode } from './'

export class Activity {
    id: string = ''
    condition?: string = ''
    ordinal: number = 0
    executionMode?: ExecutionMode = ExecutionMode.Sequential
    processes?: Array<ProcessorDef> = []
    activities?: Array<Activity> = []
}