'use strict';

const getExistingEntries = require('./files');
const handleDynamicRoutesMapping = require('./mapping');
const generateSitemapFromEntries = require('./generate');

module.exports = {
    getExistingEntries,
    handleDynamicRoutesMapping,
    generateSitemapFromEntries,
};
