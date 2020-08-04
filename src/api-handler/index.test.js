import request from 'supertest';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import createSitemapApiHandler from '.';

const enhance = (handler) => (req, res) => apiResolver(req, res, undefined, handler);

beforeEach(() => {
    process.env._NEXT_SITEMAPS_ = JSON.stringify({ siteUrl: 'https://my-site.com', routes: ['/foo', '/bar'] });
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();
});

it('should respond with the correct XML', async () => {
    const handler = createSitemapApiHandler('https://my-site.com');

    const response = await request(enhance(handler))
        .get('/')
        .expect('Content-Type', 'application/xml')
        .expect(200);

    const expectedSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://my-site.com/bar</loc></url>
<url><loc>https://my-site.com/foo</loc></url>
</urlset>`;

    expect(response.text).toEqual(expectedSitemap);
});

it('should respond with 500 if any mapper throws', async () => {
    process.env._NEXT_SITEMAPS_ = JSON.stringify({ siteUrl: 'https://my-site.com', routes: ['/[page]', '/bar'] });

    jest.spyOn(console, 'error').mockImplementation();
    process.env.__NEXT_ROUTES__ = '["/[page]"]';

    const handler = createSitemapApiHandler({
        mapDynamicRoutes: {
            '/[page]': () => Promise.reject(new Error('foo')),
        },
    });

    const response = await request(enhance(handler))
        .get('/')
        .expect('Content-Type', /^application\/json/)
        .expect(500);

    expect(response.body).toEqual({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred',
    });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, expect.stringContaining('foo'));
});

it('should respond with the correct default Cache-Control', async () => {
    let handler = createSitemapApiHandler();

    await request(enhance(handler))
        .get('/')
        .expect('Content-Type', 'application/xml')
        .expect('Cache-Control', 'public, max-age=0')
        .expect(200);

    process.env.NODE_ENV = 'production';

    handler = createSitemapApiHandler();

    await request(enhance(handler))
        .get('/')
        .expect('Content-Type', 'application/xml')
        .expect('Cache-Control', 'public, max-age=3600')
        .expect(200);
});

it('should allow overriding Cache-Control', async () => {
    const handler = createSitemapApiHandler({
        cacheControl: 'public, max-age=999',
    });

    await request(enhance(handler))
        .get('/')
        .expect('Content-Type', 'application/xml')
        .expect('Cache-Control', 'public, max-age=999')
        .expect(200);
});

it('should allow custom logError', async () => {
    process.env._NEXT_SITEMAPS_ = JSON.stringify({ siteUrl: 'https://my-site.com', routes: ['/[page]'] });

    const logError = jest.fn();
    const err = new Error('foo');
    const handler = createSitemapApiHandler({
        logError,
        mapDynamicRoutes: {
            '/[page]': () => Promise.reject(err),
        },
    });

    await request(enhance(handler))
        .get('/')
        .expect('Content-Type', /^application\/json/)
        .expect(500);

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError.mock.calls[0][0]).toMatchObject({
        data: {
            originalError: err,
        },
    });
});

it('should allow custom logWarning', async () => {
    process.env._NEXT_SITEMAPS_ = JSON.stringify({ siteUrl: 'https://my-site.com', routes: ['/[page]'] });

    const logWarning = jest.fn();
    const handler = createSitemapApiHandler({
        logWarning,
    });

    await request(enhance(handler))
        .get('/')
        .expect('Content-Type', 'application/xml')
        .expect(200);

    expect(logWarning).toHaveBeenCalledTimes(1);
    expect(logWarning).toHaveBeenNthCalledWith(1, expect.stringContaining('/[page]'));
});

it('should respond with 405 on unsupported HTTP methods', async () => {
    const handler = createSitemapApiHandler();

    const response = await request(enhance(handler))
        .post('/')
        .expect('Content-Type', /^application\/json/)
        .expect(405);

    expect(response.body).toEqual({
        statusCode: 405,
        error: 'Method Not Allowed',
        message: 'Method POST is not supported for this endpoint',
    });

    // Response must include an Allow header
    expect(response.headers.allow).toEqual('GET');
});

it('should fail if plugin is not enabled', async () => {
    delete process.env._NEXT_SITEMAPS_;
    expect(() => createSitemapApiHandler()).toThrow(/No _NEXT_SITEMAPS_ env variable found/);
});
