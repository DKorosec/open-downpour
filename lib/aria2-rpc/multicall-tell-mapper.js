const utils = require('../utils');
const mapper = (property, mapFn = v => v) => ({ property, mapFn });
const propertiesMapping = [
    mapper('gid'),
    mapper('status'),
    mapper('seeder', utils.parser.convertToBoolean),
    mapper('dir'),
    mapper('connections', utils.parser.convertToNumber),
    mapper('numSeeders', utils.parser.convertToNumber),
    mapper('downloadSpeed', utils.parser.convertToNumber),
    mapper('completedLength', utils.parser.convertToNumber),
    mapper('totalLength', utils.parser.convertToNumber),
    mapper('uploadSpeed', utils.parser.convertToNumber),
    mapper('uploadLength', utils.parser.convertToNumber),
    mapper('verifiedLength', utils.parser.convertToNumber),
    mapper('verifyIntegrityPending', utils.parser.convertToNumber),
    mapper('followedBy'),
    mapper('errorCode', utils.parser.convertToNumber),
    mapper('errorMessage'),
];
const properties = propertiesMapping.map(({ property }) => property);
const propertiesConverter = propertiesMapping.reduce((acc, c) => ({ ...acc, [c.property]: c.mapFn }), {});
const objectTransformer = s => Object.entries(s)
    .reduce((acc, [k, v]) => (acc[k] = propertiesConverter[k](v), acc), {});

module.exports = {
    properties,
    propertiesConverter,
    objectTransformer
};