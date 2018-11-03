# KYBER SERVER

[<- Back to Index](./INDEX.md)

## SCHEMATIC
Use a schematic to describe the series of Activities and corresponding processes to execute to complete the workflow. 
This includes the expected INPUT parameters, any SHARED RESOURCES required for the Activities along with the Array of 
ACTIVITYs themselves.

#### Create a Schematic
Extend the Kyber Schematic Class and assign member properties.

```
import { Schematic, Parameter, Activity } from 'kyber-server'
import { DataProvider } from '../common'
import { HealthCheckComposer } from '../composers'

export class HealthCheckGetSchematic extends Schematic {

    id: string = 'HealthCheckSchematic'
    description: string = 'Use GET verb to check the health of the service.'
    timeout: 10000
    parameters: Array<Parameter> = []
    sharedResources: Array<any> = [
        DataProvider
    ]

    activities: Array<Activity> = [
    {
        id: 'COMPOSE',
        ordinal: 0,
        executionMode: 1,
        processes: [{
            class: HealthCheckComposer
        }],
        activities: []
    }]

}
```
| Field         | Description                       |
|---------------|-----------------------------------|
| `id`            | Any string value. Unique identifier for the schematic. Does not have to relate to the class used.|
| `description`   | Description for the schematic |
| `timeout`       | Optional timeout in milliseconds to allow a schematic to run before returning http status 408 Request Timed Out. Default is 5000 milliseconds (5 seconds). |
| `parameters`    | see PARAMETERS section below |
| `sharedResources` | List of Types required as Shared Resources. Verified by Execution Context to ensure shared resources are passed properly. |
| `activities`    | Array of ACTIVITY Objects. |



#### Declare and Assign a Schematic to Route
Before we start the server, we must assign routes to schematics as below. The order these assignments are made is important relative to one another. The PATHs used may or may not take precedent from one another according to any routing implementation limitations e.g. if you create path /api/health/:id and another path /api/health/detail, the :id path will take precedent over the 2nd.

```
const healthCheckGetSchematic: HealthCheckGetSchematic = new HealthCheckGetSchematic()
kyber.registerRoute({
    verb: 'GET',
    path: '/health',
    schematic: healthCheckGetSchematic,
    sharedResources: [
        {
            name: 'dataProvider',
            instanceOfType: dataProvider
        }
    ]
})
```
| Field         | Description                        |
|---------------|------------------------------------|
| `verb`          | GET, POST, PUT, DELETE, PURGE and any other verb supported by connect middleware. Here is a [List](https://expressjs.com/en/4x/api.html#app.METHOD) of supported verbs. |
| `path`          | Path used to identify the Route. Follows normal Router path convention e.g. `/some/path/:parameter` where `:parameter` becomes `req.params.parameter`. |
| `schematic`     | Instance of the Schematic class to assign to the Route. |
| `sharedResources` | An array of name and value pairs of a unique key name for the shared resource to be consumed alongside its INSTANCE of the class (Singleton). Consumers executed by Execution context are able to retrieve the instance of the singleton using the convention `this.executionContext.getSharedResource(name)`. |


#### Schematic with Parameters
When expecting parameters to be passed or used by the Schematic, you must declare those parameters as an Array of Parameter in the Schematic Class.

```
    parameters: Array<Parameter> = [{
        name: 'wkt',
        source: 'req.query.wkt',
        required: true,
        dataType: 'string',
        validators: []
    },
    {
        name: 'contentType',
        source: 'req.headers.Content-Type',
        required: true,
        dataType: 'string',
        whiteList: ['application/json'],
        validators: [
            function(value) {
                return value === value
            }
        ]
    }]
```
| Field         | Description                       |
|---------------|-----------------------------------|
| `name`          | The name of the field to be referenced when requested from the Execution Context using the convention `this.executionContext.getParameterValue('wkt')` |
| `source`        | How to load the value of this parameter from the Request Context or Execution Context. For a full list of acceptable sources, see below. |
| `required`      | When set to true, if a value cannot be determined for the field, an Invalid Request (http status 400) error will be raised. |
| `dataType`      | Validate the data type of the value passed and resolved. Valid data types include `string`, `number`, `date` and `boolean` |
| `whiteList`     | An array of values to compare against the resolved value. If the value provided is NOT in this list an Invalid Request (http status 400) error will be raised. |
| `blackList`     | An array of values to compare against the resolved value. If the value provided IS in this list an Invalid Request (http status 400) error will be raised. |
| `validators`    | An array of functions to which the resolved value is passed. Function must return a boolean of TRUE it is value or FALSE if it is not. A list of common Validators is also provided (see below). |

Sources for a Parameter can be expressed using the following values. You may separate multiple `expressions` using a double pipe delimiter `||`. In the event a null value is returned for any expression, the next expression will be evaluated until either a value is realized or no more expressions exist.

| Value         | Description                       |
|---------------|-----------------------------------|
| `req.query.name` | Value loaded from the Request Query String using `name` as the key e.g. `req.query.id` with query string `?id=123` loads value `123` into the field. |
| `req.body.name` | Value loaded from the Request Body provided in the POST or other operation. |
| `req.params.name` | Value loaded from params of the Route e.g. `/api/health/:id` with a source of `req.params.id` and url of `/api/health/222` loads the value `222` into field's value. |
| `req.cookies.name` | Value loaded from the Request Cookies collection using the `name` as the key for the value. |
| `req.signedCookies.name` | If using Signed Cookies, value is loaded from the Request Signed Cookies collection using the `name` as the key for the value. |
| `req.headers.name` | Value loaded from the Request Headers Collection using `name` as the Header Key. |
| `req.id` | Value loaded from the Request Correlation Id. This value is set on every request to the server and is UUID v.4 unique. |
| `process.env.name` | Value loaded from Node Process Environment Variable with `name` as the key. |
| `config.name` | Value loaded from Node Config file `npm install config --save` using `name` as the configuration key. |
| `=value`      | Value is set equal to the value expressed to the right of the equal sign e.g. `=123` sets the value to `123`. |

##### EXAMPLES
| Example       | Description                      |
|---------------|----------------------------------|
| <code>req.query.wkt\|\|req.body.wkt</code> | Will first look for a value provided as a query string parameter named `wkt`. If no query string parameter exists the value will be pulled from the Request Body. |
| <code>req.headers.Content-Type\|\|=application/json</code> | Value will be loaded from the Header `Content-Type` set with the Request. If `Content-Type` does not exist, the value `application/json` will be used. |
| `req.body.id` | Will look for a Request Body field named `id` and set the value accordingly. If `id` does not exist or `body` does not exist, the value will remain `null`. If the value is also set to `required: true` an Invalid Request (400) will be thrown. |
| `process.env.connectionString` | Load the value from the Node Process Environment Variable titled `connectionString`. Environment variables can be set using `dotenv` and not loaded into source control. If `process.env.connectionString` does not exist, the value remains `null`|

#### BUILT IN KYBER VALIDATORS
Some validators are baked into the framework. A list is provided below with notes for usage.

You can pass any number of validators to the parameter type and each will be evaluated as the value is composed. If any validator fails, the Request will fail as Invalid Request (400).

##### EXAMPLES
```
import { ValidatorType e.g. StartsWith, EndsWith } from `kyber-server`
...
{
    name: 'contentType',
    source: 'req.headers.Content-Type',
    required: true,
    dataType: 'string',
    whiteList: ['application/json'],
    validators: [
        function (value) {
            return StartsWith('test', value)
        },
        function (value) {
            return StartsWithAny(['test', '1', '555'], value)
        },
        function (value) {
            return EndsWith('hey', value)
        },
        function (value) {
            return EndsWithAny(['hey', 'hello', 'welcome'], value)
        },
        function (value) {
            return Length(3, value)
        },
        function (value) {
            return MinLength(1, value)
        },
        function (value) {
            return MaxLength(10, value)
        },
        function (value) {
            return Range(0, 100, value)
        },
        function (value) {
            return Min(0, value)
        },
        function (value) {
            return Max(100, value)
        },
        function (value) {
            return MinDate(new Date('01/01/2000'), value)
        },
        function (value) {
            return MaxDate(new Date('12/31/2030'), value)
        },
        function (value) {
            return IsFloat(value)
        },
        function (value) {
            return IsObject(value)
        },
        function (value) {
            return IsArray(value)
        },
        function (value) {
            return Contains('world', value)
        },
        function (value) {
            return ContainsAny(['world', 'hello', '1'], value)
        }
    ]
}
```
*NOTE* Keep in mind string comparisons are case-sensitive.

##### SET IN PARAMETER DEFINITION
| Validator     | Description                      |
|---------------|----------------------------------|
| `required`      | Expressed as a `boolean` field on the `parameter` definition. When set to true, if value remains `null` when set, an Invalid Request (400) error will be raised. |
| `dataType`      | Value will be verified as a specific data type e.g. is it a `string`, `boolean`, `date` or `number`. |
| `whiteList`     | Value must exist in the list of values. |
| `blackList`     | Value must NOT exist in the list of values. |

##### SET USING KYBER VALIDATORS IN THE VALIDATORS COLLECTION OF THE PARAMETER OR USING CUSTOM VALIDATOR FUNCTION
| Validator     | Description                      |
|---------------|----------------------------------|
| `StartsWith`    | Takes an argument `string` validated against the value to ensure the value `begins with` the argument text. |
| `StartsWithAny`    | Takes an argument `Array<string>` validated against the value to ensure the value `begins with` any one item in the list. |
| `EndsWith`      | Similar to `startsWith` except ensures the value `ends with` the argument text. |
| `EndsWithAny`      | Similar to `endsWith` except ensures the value `ends with` the any one item in the list. |
| `Length`        | Takes an argument `number` describing the length the value MUST be. |
| `MinLength`     | Takes an argument `number` describing the length the value must be at a minimum. |
| `MaxLength`     | Takes an argument `number` describing the maximum allowable length of the value. |
| `Range`         | Takes an argument `number`, `number` describing the minimum allowable value and the maximum allowable number respectively. |
| `Min`           | Takes an argument `number` the value must be `greater than or equal to`. |
| `Max`           | Takes an argument `number` the value must be `less than or equal to`. |
| `MinDate`       | Takes an argument `date` the value must be `greater than or equal to`. |
| `MaxDate`       | Takes an argument `date` the value must be `less than or equal to`. |
| `IsFloat`       | Checks that the value is a floating point number e.g. has a decimal. |
| `IsObject`      | Checks if the value is a JavaScript object type e.g. JSON. |
| `IsArray`       | Checks if the value is a JavaScript array type e.g. JSON Array. |
| `Contains`      | Takes an argument of `any` checking that the value `contains` the `argument`. |
| `ContainsAny`      | Takes an argument of `Array<any>` checking that the value `contains` any item within list `argument`. |
