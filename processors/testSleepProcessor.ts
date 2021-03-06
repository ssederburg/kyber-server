import { BaseProcessor, ProcessorResponse } from '../schemas'
import { Utilities } from '../utilities/utilities'

export class TestSleepProcessor extends BaseProcessor {

    fx(args?: any): Promise<ProcessorResponse> {

        const result: Promise<ProcessorResponse> = new Promise((resolve, reject) => {
            try {
                let timeout = 0
                
                if (!args || !args.timeout || !Utilities.isNumber(args.timeout)) {
                    console.log(`KyberServer.TestSleepProcessor.Warning: Invalid value set in schematic for args.timeout. Using default of 1 second.`)
                    timeout = 1000
                } else {
                    timeout = args.timeout
                }

                setTimeout(() => {
                    return resolve({
                        successful: true
                    })
                }, timeout)
            }
            catch (err) {
                return reject({
                    successful: false,
                    message: `TestSleepProcessor.Error`,
                    data: err
                })
            }
        })

        return result

    }

}