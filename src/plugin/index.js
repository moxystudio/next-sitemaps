import NextSitemapWebpackPlugin from './NextSitemapWebpackPlugin';

const withSitemap = () => (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config, options) {
        config.plugins.push(new NextSitemapWebpackPlugin());

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});

export default withSitemap;
