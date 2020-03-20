'use strict';

const {
    buildEntriesFromFileSystem,
    handleDynamicRoutesMapping,
    writeEntriesToSitemap,
} = require('./handlers');

/**
 * Adds the sitemap handling into the next build system.
 *
 * @param {object} [nextConfig={}] - The next config that should be used in this plugin.
 * @returns {object} - The extended next config with a specific webpack handler for this plugin.
 */
module.exports = (nextConfig = {}) => ({
    ...nextConfig,
    /**
     * Handles the sitemap construction.
     *
     * @param {object} config - A webpack config file.
     * @param {object} options - The options for the next plugins.
     * @param {object} options.config - The configuration for this plugin.
     * @param {string} options.config.baseUrl - The base URL that should be used to prefix all the routes.
     * @param {object<string, Function>} options.config.mapDynamicRoutes - An object containing information of how to handle a certain dynamic route.
     * @param {string} options.config.sitemapsLocation - The location of where you want the file to be saved to.
     * @returns {object} - The config or the result of next webpack handler.
     */
    webpack(config, options) {
        const {
            baseUrl = '/',
            mapDynamicRoutes,
            sitemapsLocation = 'public/sitemaps.xml',
        } = options.config;

        const sitemapEntries = buildEntriesFromFileSystem();

        const mappedEntries = sitemapEntries
            .concat()
            .sort()
            .map((entry) => handleDynamicRoutesMapping(entry, mapDynamicRoutes))
            .filter((entry) => !!entry);

        const writableEntries = [].concat(...mappedEntries);

        writeEntriesToSitemap(writableEntries, { baseUrl, sitemapsLocation });

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});
