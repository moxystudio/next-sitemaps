import mapRoutes from './map-routes';

const logWarningSpy = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
});

it('should map static routes correctly', async () => {
    const routes = ['/page1', '/', '/page2'];

    const mappedRoutes = await mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes: {},
    });

    expect(mappedRoutes).toEqual(['/', '/page1', '/page2']);
});

it('should throw if any mapper throws', async () => {
    const routes = ['/', '/page1', '/[id]'];
    const mapDynamicRoutes = { '/[id]': () => Promise.reject(new Error('foo')) };

    const rejectedHandling = mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes,
    });

    await expect(rejectedHandling).rejects.toThrow('foo');
});

it('should call logWarning when there are unmapped routes', async () => {
    const routes = ['/', '/page1/[id]', '/[page]'];

    const mappedRoutes = await mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes: {},
    });

    expect(mappedRoutes).toEqual(['/']);
    expect(logWarningSpy).toHaveBeenCalledTimes(2);
    expect(logWarningSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('/[page]'));
    expect(logWarningSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('/page1/[id]'));
});

it('should map dynamic routes correctly', async () => {
    const routes = ['/[page]/foo', '/', '/[page]/bar'];
    const mapDynamicRoutes = {
        '/[page]': jest.fn(() => ['page1', 'page2']),
    };

    const mappedRoutes = await mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes,
    });

    expect(mappedRoutes).toEqual([
        '/',
        '/page1/bar',
        '/page1/foo',
        '/page2/bar',
        '/page2/foo',
    ]);

    expect(mapDynamicRoutes['/[page]']).toHaveBeenCalledTimes(1);
    expect(mapDynamicRoutes['/[page]']).toHaveBeenNthCalledWith(1, {});
});

it('should map complex dynamic routes correctly', async () => {
    const routes = [
        '/[page]/[foo]',
        '/[page]',
        '/[page]/[foo]/barz',
        '/',
        '/[page]/[foo]/barz/[bar]',
    ];
    const mapDynamicRoutes = {
        '/[page]': jest.fn(() => ['page1', 'page2']),
        '/[page]/[foo]': jest.fn(({ page }) => {
            if (page === 'page1') {
                return ['foo1', 'foo2'];
            }

            return ['foo1'];
        }),
        '/[page]/[foo]/barz/[bar]': jest.fn(() => ['bar1', 'bar2']),
    };

    const mappedRoutes = await mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes,
    });

    expect(mappedRoutes).toEqual([
        '/',
        '/page1',
        '/page1/foo1',
        '/page1/foo1/barz',
        '/page1/foo1/barz/bar1',
        '/page1/foo1/barz/bar2',
        '/page1/foo2',
        '/page1/foo2/barz',
        '/page1/foo2/barz/bar1',
        '/page1/foo2/barz/bar2',
        '/page2',
        '/page2/foo1',
        '/page2/foo1/barz',
        '/page2/foo1/barz/bar1',
        '/page2/foo1/barz/bar2',
    ]);

    expect(mapDynamicRoutes['/[page]']).toHaveBeenCalledTimes(1);
    expect(mapDynamicRoutes['/[page]']).toHaveBeenNthCalledWith(1, {});
    expect(mapDynamicRoutes['/[page]/[foo]']).toHaveBeenCalledTimes(2);
    expect(mapDynamicRoutes['/[page]/[foo]']).toHaveBeenNthCalledWith(1, { page: 'page1' });
    expect(mapDynamicRoutes['/[page]/[foo]']).toHaveBeenNthCalledWith(2, { page: 'page2' });
    expect(mapDynamicRoutes['/[page]/[foo]/barz/[bar]']).toHaveBeenCalledTimes(3);
    expect(mapDynamicRoutes['/[page]/[foo]/barz/[bar]']).toHaveBeenNthCalledWith(1, { page: 'page1', foo: 'foo1' });
    expect(mapDynamicRoutes['/[page]/[foo]/barz/[bar]']).toHaveBeenNthCalledWith(2, { page: 'page1', foo: 'foo2' });
    expect(mapDynamicRoutes['/[page]/[foo]/barz/[bar]']).toHaveBeenNthCalledWith(3, { page: 'page2', foo: 'foo1' });
});

it('should map dynamic catch all routes correctly', async () => {
    const routes = ['/[...page]', '/'];
    const mapDynamicRoutes = {
        '/[...page]': jest.fn(() => ['page1', 'page2']),
    };

    const mappedRoutes = await mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes,
    });

    expect(mappedRoutes).toEqual([
        '/',
        '/page1',
        '/page2',
    ]);

    expect(mapDynamicRoutes['/[...page]']).toHaveBeenCalledTimes(1);
    expect(mapDynamicRoutes['/[...page]']).toHaveBeenNthCalledWith(1, {});
});

it('should map complex dynamic catch all routes correctly', async () => {
    const routes = [
        '/foo/[...foo]/barz',
        '/[page]/[...foo]',
        '/',
    ];
    const mapDynamicRoutes = {
        '/foo/[...foo]': jest.fn(() => ['bar', 'baz']),
        '/[page]': jest.fn(() => ['page1', 'page2']),
        '/[page]/[...foo]': jest.fn(({ page }) => {
            if (page === 'page1') {
                return ['foo1', 'foo2'];
            }

            return ['foo1'];
        }),
    };

    const mappedRoutes = await mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes,
    });

    expect(mappedRoutes).toEqual([
        '/',
        '/foo/bar/barz',
        '/foo/baz/barz',
        '/page1/foo1',
        '/page1/foo2',
        '/page2/foo1',
    ]);

    expect(mapDynamicRoutes['/foo/[...foo]']).toHaveBeenCalledTimes(1);
    expect(mapDynamicRoutes['/foo/[...foo]']).toHaveBeenNthCalledWith(1, {});
    expect(mapDynamicRoutes['/[page]']).toHaveBeenCalledTimes(1);
    expect(mapDynamicRoutes['/[page]']).toHaveBeenNthCalledWith(1, { });
    expect(mapDynamicRoutes['/[page]/[...foo]']).toHaveBeenCalledTimes(2);
    expect(mapDynamicRoutes['/[page]/[...foo]']).toHaveBeenNthCalledWith(1, { page: 'page1' });
    expect(mapDynamicRoutes['/[page]/[...foo]']).toHaveBeenNthCalledWith(2, { page: 'page2' });
});

it('should wait for promises when mapping dynamic routes', async () => {
    const routes = ['/[page]/foo', '/', '/[page]/bar'];
    const mapDynamicRoutes = {
        '/[page]': jest.fn(() => (
            new Promise((resolve) => {
                setTimeout(() => resolve(['page1', 'page2']), 10);
            })
        )),
    };

    const mappedRoutes = await mapRoutes(routes, {
        logWarning: logWarningSpy,
        mapDynamicRoutes,
    });

    expect(mappedRoutes).toEqual([
        '/',
        '/page1/bar',
        '/page1/foo',
        '/page2/bar',
        '/page2/foo',
    ]);

    expect(mapDynamicRoutes['/[page]']).toHaveBeenCalledTimes(1);
    expect(mapDynamicRoutes['/[page]']).toHaveBeenNthCalledWith(1, {});
});
