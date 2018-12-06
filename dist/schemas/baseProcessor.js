export class BaseProcessor {
    constructor(executionContext, processorDef) {
        this.executionContext = executionContext;
        this.processorDef = processorDef;
    }
    fx(args) {
        return Promise.resolve({
            successful: false
        });
    }
}
