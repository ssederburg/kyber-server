import { BaseProcessor, ProcessorResponse } from '../schemas';
export declare class TestSleepProcessor extends BaseProcessor {
    fx(args?: any): Promise<ProcessorResponse>;
}
