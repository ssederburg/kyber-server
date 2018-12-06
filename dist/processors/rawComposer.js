import { BaseProcessor } from '../schemas';
export class RawComposer extends BaseProcessor {
    fx(args) {
        const result = new Promise((resolve, reject) => {
            try {
                this.executionContext.raw = Object.assign({}, this.executionContext.raw, args);
                return resolve({
                    successful: true
                });
            }
            catch (err) {
                return reject({
                    successful: false,
                    message: `RawComposer.Error`,
                    data: err
                });
            }
        });
        return result;
    }
}
