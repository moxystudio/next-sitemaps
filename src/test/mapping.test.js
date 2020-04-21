const logWarningSpy = jest.fn();
let handleDynamicRoutesMapping;

beforeEach(() => {
    jest.resetModules();
    handleDynamicRoutesMapping = require('../api-handler/mapping');
});

describe('When entries are passed', () => {
    it('should map static entries correctly', async () => {
        const sitemapEntries = ['/', '/page1', '/page2'];
        const mapDynamicRoutes = {};

        const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, {
            logWarning: logWarningSpy,
            mapDynamicRoutes,
        });

        expect(mappedEntries).toEqual(['/', '/page1', '/page2']);
    });

    it('should throw if any mapper throws', async () => {
        const sitemapEntries = ['/', '/page1', '/[id]'];
        const mapDynamicRoutes = { '/[id]': () => Promise.reject(new Error('foo')) };

        const rejectedHandling = handleDynamicRoutesMapping(sitemapEntries, {
            logWarning: logWarningSpy,
            mapDynamicRoutes,
        });

        await expect(rejectedHandling).rejects.toThrow('foo');
    });

    it('should call logWarning when there are unmapped entries', async () => {
        const sitemapEntries = ['/', '/page1', '/[id]'];
        const mapDynamicRoutes = {};

        const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, {
            logWarning: logWarningSpy,
            mapDynamicRoutes,
        });

        expect(mappedEntries).toEqual(['/', '/page1']);
        expect(logWarningSpy).toHaveBeenCalledWith('WARNING: There are unmapped dynamic routes:\n/[id]');
    });

    it('should map dynamic entries correctly', async () => {
        const sitemapEntries = ['/[page]/foo'];
        const mapDynamicRoutes = {
            '/[page]/foo': () => ['page1', 'page2'],
        };

        const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, {
            logWarning: logWarningSpy,
            mapDynamicRoutes,
        });

        expect(mappedEntries).toEqual(['/page1/foo', '/page2/foo']);
    });

    it('should map chained dynamic entries correctly (2 levels)', async () => {
        const sitemapEntries = ['/[page]/[foo]/barz', '/'];
        const mapDynamicRoutes = {
            '/[page]': () => ['page1', 'page2'],
            '/[page]/[foo]/barz': ({ page }) => {
                if (page === 'page1') {
                    return ['foo1', 'foo2'];
                }

                return ['foo1'];
            },
        };

        const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, {
            logWarning: logWarningSpy,
            mapDynamicRoutes,
        });

        expect(mappedEntries).toEqual([
            '/page1/foo1/barz',
            '/page1/foo2/barz',
            '/page2/foo1/barz',
            '/',
        ]);
    });

    it('should map chained dynamic entries correctly (3 levels)', async () => {
        const sitemapEntries = ['/[page]/[foo]', '/[page]/[foo]/[bar]'];
        const mapDynamicRoutes = {
            '/[page]': () => ['page1', 'page2'],
            '/[page]/[foo]': () => ['foo1'],
            '/[page]/[foo]/[bar]': () => ['bar1', 'bar2', 'bar3'],
        };

        const mappedEntries = await handleDynamicRoutesMapping(sitemapEntries, {
            logWarning: logWarningSpy,
            mapDynamicRoutes,
        });

        expect(mappedEntries).toEqual([
            '/page1/foo1',
            '/page2/foo1',
            '/page1/foo1/bar1',
            '/page1/foo1/bar2',
            '/page1/foo1/bar3',
            '/page2/foo1/bar1',
            '/page2/foo1/bar2',
            '/page2/foo1/bar3',
        ]);
    });

    it('should call mapDynamicRoutes function with proper previous mapped values', async () => {
        const levelOneMapFunction = jest.fn().mockImplementation(() => ['page1', 'page2']);
        const levelTwoMapFunction = jest.fn().mockImplementation(() => ['foo1']);
        const levelThreeMapFunction = jest.fn().mockImplementation(() => ['bar1', 'bar2', 'bar3']);

        const sitemapEntries = ['/[page]/[foo]', '/[page]/[foo]/[bar]'];
        const mapDynamicRoutes = {
            '/[page]': levelOneMapFunction,
            '/[page]/[foo]': levelTwoMapFunction,
            '/[page]/[foo]/[bar]': levelThreeMapFunction,
        };

        await handleDynamicRoutesMapping(sitemapEntries, {
            logWarning: logWarningSpy,
            mapDynamicRoutes,
        });

        expect(levelOneMapFunction).toHaveBeenCalledTimes(1);
        expect(levelOneMapFunction).toHaveBeenCalledWith();

        expect(levelTwoMapFunction).toHaveBeenCalledTimes(2);
        expect(levelTwoMapFunction).toHaveBeenNthCalledWith(1, { page: 'page1' });
        expect(levelTwoMapFunction).toHaveBeenNthCalledWith(2, { page: 'page2' });

        expect(levelThreeMapFunction).toHaveBeenCalledTimes(2);
        expect(levelThreeMapFunction).toHaveBeenNthCalledWith(1, { page: 'page1', foo: 'foo1' });
        expect(levelThreeMapFunction).toHaveBeenNthCalledWith(2, { page: 'page2', foo: 'foo1' });
    });
});
