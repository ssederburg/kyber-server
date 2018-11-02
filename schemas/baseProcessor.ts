import { ExecutionContext } from "../executionContext";
import { BaseDefSchema } from "./baseDefSchema";

export class BaseProcessor {

    constructor(protected executionContext: ExecutionContext, protected baseDefSchema: BaseDefSchema) {

    }

    public fx(): Promise<boolean> {
        return Promise.resolve(true)
    }
    
}