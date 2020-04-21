import withSitemap from '../plugin';
import NextSitemapWebpackPlugin from '../plugin/NextSitemapWebpackPlugin';

const webpackDefault = {
    config: { plugins: [] },
    options: {},
};

it('should add NextSitemapWebpackPlugin', () => {
    const { webpack } = withSitemap();
    const config = webpack(webpackDefault.config, webpackDefault.options);

    expect(config.plugins).toHaveLength(1);
    expect(config.plugins[0].constructor).toBe(NextSitemapWebpackPlugin);
});

it('should call nextConfig if defined', () => {
    const nextConfig = { webpack: jest.fn(() => 'foo') };
    const { webpack } = withSitemap(nextConfig);

    const config = webpack(webpackDefault.config, webpackDefault.options);

    expect(nextConfig.webpack).toHaveBeenCalledTimes(1);
    expect(config).toBe('foo');
});
