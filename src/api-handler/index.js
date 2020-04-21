import Boom from '@hapi/boom';
import generateSitemapFromEntries from './generate';
import handleDynamicRoutesMapping from './mapping';

const logErrorDefault = (err) => {
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

const logWarningDefault = (message) => console.warn(message);

const sendError = (res, err) => {
    const { output } = err;
    const { headers, statusCode, payload } = output;

    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));

    res.status(statusCode).json(payload);
};

const createSitemap = async ({ baseUrl, mapDynamicRoutes, logWarning }) => {
    if (!global.__NEXT_ROUTES__) {
        throw new Error('There are no entries to map. Did you forget to enable the plugin in the next.config.js file?');
    }

    const sitemapEntries = global.__NEXT_ROUTES__.split(',');

    const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, { logWarning, mapDynamicRoutes });
    const sitemapXml = generateSitemapFromEntries(mappedEntries, { baseUrl });

    return sitemapXml;
};

/**
 * API handler to generate a mapped sitemap.xml.
 *
 * @param {object} options - The options.
 * @param {string} options.baseUrl - The website url to join on each entry.
 * @param {object<string, Function>} options.mapDynamicRoutes - An object containing information of how to map a certain dynamic route.
 * @param {Function} options.logWarning - A function to be called whenever an entry is not mapped.
 * @param {Function} options.logError - A function to be called whenever an error occurs.
 * @returns {Function} The API handler.
 */
const createSitemapApiHandler = (options) => {
    options = {
        baseUrl: '/',
        mapDynamicRoutes: {},
        logWarning: logWarningDefault,
        logError: logErrorDefault,
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

            options.logError(err);
            sendError(res, err);
        }
    };
};

export default createSitemapApiHandler;
