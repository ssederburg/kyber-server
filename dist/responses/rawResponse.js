import { BaseProcessor } from '../schemas';
export class RawResponse extends BaseProcessor {
    fx(args) {
        const result = new Promise((resolve, reject) => {
            try {
                return resolve({
                    successful: true,
                    message: 'OK',
                    data: Object.assign({}, this.executionContext.raw)
                });
            }
            catch (err) {
                reject(err);
            }
        });
        return result;
    }
}
