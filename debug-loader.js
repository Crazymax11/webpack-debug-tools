const { getOptions } = require('loader-utils');
const validateOptions = require('schema-utils');

const schema = {
    type: 'object',
    properties: {
        callback: {
            type: 'function'
        },
        timeoutWarn: {
            type: 'number'
        }
    }
}

function loader(source) {
    const options = getOptions(this);
    validateOptions(schema, options, "debug loader");
    if (!options.callback) {
        console.log(source);
    }

    return source;
}

// 
loader.pitch = function pitch(remainingRequest, precedingRequest, data) {
    if (!data.debugLoader) {
        data.debugLoader = {}
    }
    data.debugLoader = {

    }
}
module.exports = loader;