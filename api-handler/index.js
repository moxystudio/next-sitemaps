'use strict';

const Boom = require('@hapi/boom');
const generateSitemapFromEntries = require('./generate');
const handleDynamicRoutesMapping = require('./mapping');

const handleErrorDefault = (err) => {
    // Only log internal server errors
    if (!err.isServer) {
        return;
    }

    // Log original error if passed
    if (err.data && err.data.originalError) {
        err = err.data.originalError;
    }

    console.error(err.stack);
};

const handleWarningDefault = (message) => console.warn(message);

const sendError = (res, err) => {
    const { output } = err;
    const { headers, statusCode, payload } = output;

    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));

    res.status(statusCode).json(payload);
};

const createSitemap = async ({ baseUrl, mapDynamicRoutes, handleWarning }) => {
    const sitemapEntries = global.__NEXT_ROUTES__;

    if (!sitemapEntries) {
        throw new Error('There are no entries to map. You might want to check the __NEXT_ROUTES__ global variable.');
    }

    const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, { handleWarning, mapDynamicRoutes });
    const sitemapXml = generateSitemapFromEntries(mappedEntries, { baseUrl });

    return sitemapXml;
};

/**
 * API handler to generate a mapped sitemap.xml.
 *
 * @param {object} options - The options.
 * @param {string} options.baseUrl - The website url to join on each entry.
 * @param {object<string, Function>} options.mapDynamicRoutes - An object containing information of how to map a certain dynamic route.
 * @param {Function} options.handleWarning - A function to be called whenever an entry is not mapped.
 * @param {Function} options.handleError - A function to be called whenever an error occurs.
 * @returns {Function} The API handler.
 */
module.exports = (options) => {
    options = {
        baseUrl: '/',
        mapDynamicRoutes: {},
        handleWarning: handleWarningDefault,
        handleError: handleErrorDefault,
        ...options,
    };

    return async (req, res) => {
        try {
            if (req.method !== 'GET') {
                throw Boom.methodNotAllowed(`Method ${req.method} is not supported for this endpoint`, undefined, 'GET');
            }

            const xmlFile = await createSitemap(options);

            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(xmlFile);
        } catch (err) {
            if (!err.isBoom) {
                err = Boom.internal(undefined, { originalError: err });
            }

            options.handleError(err);
            sendError(res, err);
        }
    };
};
