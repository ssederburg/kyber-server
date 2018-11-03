import { Utilities } from '../utilities/utilities'

export function StartsWith(text: string, value?: any): Boolean {
    console.log(`Running StartsWith Validator with text of ${text} and value of ${value}`)
    if (!Utilities.isString(value)) return false
    return value.indexOf(text)===0
}
