import NextSitemapWebpackPlugin from './NextSitemapWebpackPlugin';

/**
 * Adds the sitemap routes handling into the next build system.
 *
 * @param {object} [nextConfig={}] - The next config that should be used in this plugin.
 * @returns {object} - The extended next config with a specific webpack handler for this plugin.
 */
const withSitemap = (nextConfig = {}) => ({
    ...nextConfig,
    /**
     * Adds webpack plugin that will inject the routes that will be used by the API handler.
     *
     * @param {object} config - A webpack config file.
     * @param {object} options - The options for the next plugins.
     * @returns {object} - The config or the result of next webpack handler.
     */
    webpack(config, options) {
        config.plugins.push(new NextSitemapWebpackPlugin());

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});

export default withSitemap;
