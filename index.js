'use strict';

const {
    handleDynamicRoutesMapping,
    generateSitemapFromEntries,
} = require('./handlers');

const createSitemap = async ({
    baseUrl = '/',
    mapDynamicRoutes = {},
    handleWarning = (message) => console.warn(message),
}) => {
    const sitemapEntries = ['/contacts', '/', '/project/[id]', '/[ident]',
        '/[ident]/[page]/contact', '/[ident]/[page]/[stuff]', '/[ident]/[cenas]', '/project/[id]/[test]'];
    const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, { handleWarning, mapDynamicRoutes });
    const sitemapXml = generateSitemapFromEntries(mappedEntries, { baseUrl });

    return sitemapXml;
};

module.exports = (options = {}) => {
    console.log('REQUEST INIT');
    // console.log('received options:', options);
    // const {
    //     baseUrl = '/',
    //     mapDynamicRoutes = {},
    //     sitemapsLocation = 'public/sitemaps.xml',
    // } = options;

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
