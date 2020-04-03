'use strict';

const {
    getExistingEntries,
    handleDynamicRoutesMapping,
    generateSitemapFromEntries,
} = require('./handlers');

const createSitemap = async ({
    baseUrl = '/',
    mapDynamicRoutes = {},
    handleWarning = (message) => console.warn(message),
}) => {
    const sitemapEntries = getExistingEntries();

    console.log('sitemapEntries', sitemapEntries);
    const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, { handleWarning, mapDynamicRoutes });
    const sitemapXml = generateSitemapFromEntries(mappedEntries, { baseUrl });

    return sitemapXml;
};

module.exports = (options = {}) => {
    console.log('REQUEST INIT');

    return async (req, res) => {
        try {
            const xmlFile = await createSitemap(options);

            // console.log('xmlFile', xmlFile);

            res.setHeader('Content-Type', 'application/xml');
            res.end(xmlFile);
        } catch (err) {
            console.log('err');
        }
    };
};
