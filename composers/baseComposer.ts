import { ComposerDefSchema } from "../schemas";

export class BaseComposer {

    constructor(protected executionContext: any, protected composerDef: ComposerDefSchema, protected correlationId: string) {
    }

    public fx(): Promise<boolean|string> {
        return Promise.resolve(false)
    }

}