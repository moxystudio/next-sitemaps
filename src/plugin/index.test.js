import NextSitemapWebpackPlugin from './NextSitemapWebpackPlugin';
import withSitemap from './';

const webpackOptions = {};

const createWebpackConfig = () => ({
    plugins: [],
});

it('should add NextSitemapWebpackPlugin', () => {
    const config = withSitemap()().webpack(createWebpackConfig(), webpackOptions);

    expect(config.plugins).toHaveLength(1);
    expect(config.plugins[0].constructor).toBe(NextSitemapWebpackPlugin);
});

it('should call nextConfig webpack if defined', () => {
    const nextConfig = {
        webpack: jest.fn(() => 'foo'),
    };

    const config = withSitemap()(nextConfig).webpack(createWebpackConfig(), webpackOptions);

    expect(nextConfig.webpack).toHaveBeenCalledTimes(1);
    expect(config).toBe('foo');
});
