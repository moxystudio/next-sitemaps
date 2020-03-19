'use strict';

const buildEntriesFromFileSystem = require('./files');
const handleDynamicRoutesMapping = require('./mapping');
const writeEntriesToSitemap = require('./write');

module.exports = {
    buildEntriesFromFileSystem,
    handleDynamicRoutesMapping,
    writeEntriesToSitemap,
};
