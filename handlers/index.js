'use strict';

const buildEntriesFromFileSystem = require('./files');
const handleDynamicRoutesMapping = require('./mapping');
const generateSitemapFromEntries = require('./generate');

module.exports = {
    buildEntriesFromFileSystem,
    handleDynamicRoutesMapping,
    generateSitemapFromEntries,
};
