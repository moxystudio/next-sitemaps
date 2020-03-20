import plugin from '../';
import { buildEntriesFromFileSystem, writeEntriesToSitemap } from '../handlers';

jest.mock('../handlers/files', () => jest.fn());
jest.mock('../handlers/write', () => jest.fn());

describe('Sitemaps plugin', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('when receiving a simple config with no dynamic routes', () => {
        it('should create a simple sitemap', () => {
            const { webpack } = plugin();

            buildEntriesFromFileSystem.mockReturnValue(['/', '/page1', '/page2']);
            const result = webpack({}, { config: { baseUrl: 'batatas.com' } });

            expect(writeEntriesToSitemap).toHaveBeenCalledWith(['/', '/page1', '/page2'], {
                baseUrl: 'batatas.com',
                sitemapsLocation: 'public/sitemaps.xml',
            });

            expect(result).toEqual({});
        });
    });

    describe('when receiving a config with unspecified dynamic routes', () => {
        it('should discard it and proceed to create the sitemap', () => {
            const { webpack } = plugin();

            buildEntriesFromFileSystem.mockReturnValue(['/', '/[page]']);
            const result = webpack({}, { config: { baseUrl: 'batatas.com' } });

            expect(writeEntriesToSitemap).toHaveBeenCalledWith(['/'], {
                baseUrl: 'batatas.com',
                sitemapsLocation: 'public/sitemaps.xml',
            });

            expect(result).toEqual({});
        });
    });

    describe('when receiving a config with multiple unspecified dynamic routes', () => {
        it('should discard them and proceed to create the sitemap', () => {
            const { webpack } = plugin();

            buildEntriesFromFileSystem.mockReturnValue(['/', '/[page]', '/[page]/[id]', '/[page]/[id]/cool']);
            const result = webpack({}, { config: { baseUrl: 'batatas.com' } });

            expect(writeEntriesToSitemap).toHaveBeenCalledWith(['/'], {
                baseUrl: 'batatas.com',
                sitemapsLocation: 'public/sitemaps.xml',
            });

            expect(result).toEqual({});
        });
    });

    describe('when receiving a config with dynamic routes that are not mapped', () => {
        it('should discard them and proceed to create the sitemap', () => {
            const { webpack } = plugin();

            buildEntriesFromFileSystem.mockReturnValue(['/', '/[page]', '/[page]/[about]']);
            const result = webpack({},
                {
                    config: {
                        baseUrl: 'batatas.com',
                        mapDynamicRoutes: {
                            '/[about]': () => ['oops, wrong map!'],
                        },
                    },
                },
            );

            expect(writeEntriesToSitemap).toHaveBeenCalledWith(['/'], {
                baseUrl: 'batatas.com',
                sitemapsLocation: 'public/sitemaps.xml',
            });

            expect(result).toEqual({});
        });
    });

    describe('when receiving a config with a dynamic route', () => {
        it('should map it correctly', () => {
            const { webpack } = plugin();

            buildEntriesFromFileSystem.mockReturnValue(['/', '/[page]']);
            const result = webpack({}, { config: {
                baseUrl: 'batatas.com',
                mapDynamicRoutes: {
                    '/[page]': () => ['page-1', 'page-2', 'page-abc'],
                },
            } });

            expect(writeEntriesToSitemap).toHaveBeenCalledWith(['/', '/page-1', '/page-2', '/page-abc'], {
                baseUrl: 'batatas.com',
                sitemapsLocation: 'public/sitemaps.xml',
            });

            expect(result).toEqual({});
        });
    });

    describe('when receiving a config with multiple dynamic routes', () => {
        it('should map them correctly', () => {
            const { webpack } = plugin();

            buildEntriesFromFileSystem.mockReturnValue(['/', '/[page]', '/[page]/[id]']);
            const result = webpack({}, { config: {
                baseUrl: 'batatas.com',
                mapDynamicRoutes: {
                    '/[page]': () => ['home', 'about'],
                    '/[page]/[id]': ({ page }) => [`${page}-1`, `${page}-2`],
                },
            } });

            expect(writeEntriesToSitemap).toHaveBeenCalledWith(
                ['/', '/home', '/about', '/home/home-1', '/home/home-2', '/about/about-1', '/about/about-2'], {
                    baseUrl: 'batatas.com',
                    sitemapsLocation: 'public/sitemaps.xml',
                });

            expect(result).toEqual({});
        });
    });

    describe('when receiving a config with multiple dynamic routes but a parent page was not mapped', () => {
        it('should throw an error and continue the sitemap building', () => {
            const { webpack } = plugin();

            console.error = jest.fn();
            buildEntriesFromFileSystem.mockReturnValue(['/', '/[post]', '/[post]/[id]']);

            const result = webpack({}, { config: {
                baseUrl: 'batatas.com',
                mapDynamicRoutes: {
                    '/[post]/[id]': ({ post }) => [`${post}-1`, `${post}-2`],
                },
            } });

            expect(console.error).toHaveBeenCalledWith("You haven't mapped the /[post] route yet!");

            expect(writeEntriesToSitemap).toHaveBeenCalledWith(['/'], {
                baseUrl: 'batatas.com',
                sitemapsLocation: 'public/sitemaps.xml',
            });

            expect(result).toEqual({});
        });
    });

    describe('Next specific algorithms', () => {
        it('should call the webpack function from next config', () => {
            const webpackMock = jest.fn();
            const { webpack } = plugin({ webpack: webpackMock });

            buildEntriesFromFileSystem.mockReturnValue([]);

            webpack('some-config', { config: 'some-configs' });

            expect(webpackMock).toHaveBeenCalledWith('some-config', { config: 'some-configs' });
        });
    });
});
