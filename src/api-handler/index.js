import assert from 'assert';
import Boom from '@hapi/boom';
import generateXml from './generate-xml';
import mapRoutes from './map-routes';

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

const logWarningDefault = (message) => console.warn(`WARNING: ${message}`);

const sendError = (res, err) => {
    const { output } = err;
    const { headers, statusCode, payload } = output;

    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));

    res.status(statusCode).json(payload);
};

const createSitemap = async (siteUrl, routes, options) => {
    const urls = await mapRoutes(routes, options);
    const fullUrls = urls.map((url) => `${siteUrl}${url}`);
    const sitemapXml = generateXml(fullUrls, siteUrl, options);

    return sitemapXml;
};

/**
 * API handler to generate a mapped sitemap.xml.
 *
 * @param {object} [options] - The options.
 * @param {object<string, Function>} [options.mapDynamicRoutes] - An object containing information of how to map a certain dynamic route.
 * @param {string} [options.cacheControl] - A string defining the Cache-Control header for HTTP responses.
 * @param {Function} [options.logWarning] - A function to be called whenever an entry is not mapped.
 * @param {Function} [options.logError] - A function to be called whenever an error occurs.
 * @returns {Function} The Next.js API handler.
 */
const createSitemapApiHandler = (options) => {
    assert(process.env._NEXT_SITEMAPS_, 'No _NEXT_SITEMAPS_ env variable found. Did you forget to enable the plugin in the next.config.js file?');

    const { routes, siteUrl } = JSON.parse(process.env._NEXT_SITEMAPS_);

    options = {
        mapDynamicRoutes: {},
        cacheControl: `public, max-age=${process.env.NODE_ENV === 'production' ? '3600' : '0'}`,
        logWarning: logWarningDefault,
        logError: logErrorDefault,
        ...options,
    };

    return async (req, res) => {
        try {
            if (req.method !== 'GET') {
                throw Boom.methodNotAllowed(`Method ${req.method} is not supported for this endpoint`, undefined, 'GET');
            }

            const xmlFile = await createSitemap(siteUrl, routes, options);

            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Cache-Control', options.cacheControl);
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
