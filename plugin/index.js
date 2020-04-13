'use strict';

const glob = require('glob');

/**
 * Adds the sitemap routes handling into the next build system.
 *
 * @param {object} [nextConfig={}] - The next config that should be used in this plugin.
 * @returns {object} - The extended next config with a specific webpack handler for this plugin.
 */
module.exports = (nextConfig = {}) => ({
    ...nextConfig,
    /**
     * Matches all files and directories inside the next's pages folder and maps them into urls.
     * These urls will be available through a global named __NEXT_ROUTES__.
     * The api folder and the template pages (_document, _error, etc) are ignored.
     *
     * @param {object} config - A webpack config file.
     * @param {object} options - The options for the next plugins.
     * @returns {object} - The config or the result of next webpack handler.
     */
    webpack(config, options) {
        if (!global.__NEXT_ROUTES__) {
            const diskRoutes = glob.sync('pages/**/*.js', { ignore: ['pages/api/**', 'pages/_*.js'] });

            if (diskRoutes.length === 0) {
                throw new Error('\'pages/\' directory is empty');
            }

            const routes = diskRoutes.map((diskRoute) => {
                const route = diskRoute.replace(/^pages/, '').replace(/.js$/, '');

                return route.replace('index', '');
            });

            global.__NEXT_ROUTES__ = routes.sort().reverse();
        }

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});
