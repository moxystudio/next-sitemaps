'use strict';

const request = require('supertest');
const { apiResolver } = require('next/dist/next-server/server/api-utils');
const setupSitemap = require('../api-handler');
const handleDynamicRoutesMapping = require('../api-handler/mapping');
const generateSitemapFromEntries = require('../api-handler/generate');

jest.mock('../api-handler/mapping', () => jest.fn());
jest.mock('../api-handler/generate', () => jest.fn());

const enhance = (handler) => (req, res) => apiResolver(req, res, undefined, handler);
const mockedSitemapXml = 'sitemap-xml';

beforeEach(() => {
    global.__NEXT_ROUTES__ = [];
    console.error.mock && console.error.mockRestore();
    console.warn.mock && console.warn.mockRestore();
});

describe('When method is supported', () => {
    it('should respond what generateSitemapFromEntries returns', async () => {
        generateSitemapFromEntries.mockReturnValue(mockedSitemapXml);

        const handler = setupSitemap();

        await request(enhance(handler))
            .get('/')
            .expect('Content-Type', 'application/xml')
            .expect(200)
            .then((res) => {
                expect(res.text).toEqual(mockedSitemapXml);
            });
    });

    it('should use the default baseUrl option if no options are passed', async () => {
        const mockedSitemapEntries = ['/', '/page1', '/page2'];

        handleDynamicRoutesMapping.mockReturnValue(mockedSitemapEntries);
        generateSitemapFromEntries.mockReturnValue(mockedSitemapXml);

        const handler = setupSitemap();

        await request(enhance(handler))
            .get('/')
            .expect('Content-Type', 'application/xml')
            .expect(200)
            .then((res) => {
                expect(res.text).toEqual(mockedSitemapXml);
                expect(generateSitemapFromEntries).toHaveBeenCalledWith(mockedSitemapEntries, {
                    baseUrl: '/',
                });
            });
    });

    it('should respond with 500 if any mapper throws', async () => {
        jest.spyOn(console, 'error').mockImplementation();
        handleDynamicRoutesMapping.mockImplementationOnce(() => { throw new Error('foo'); });

        const handler = setupSitemap();

        await request(enhance(handler))
            .get('/')
            .expect('Content-Type', /^application\/json/)
            .expect(500)
            .then((res) => {
                expect(res.body).toEqual({
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                });
            });
    });

    it('should respond with 500 if there are no entries to map', async () => {
        jest.spyOn(console, 'error').mockImplementation();
        delete global.__NEXT_ROUTES__;

        const handler = setupSitemap();

        await request(enhance(handler))
            .get('/')
            .expect('Content-Type', /^application\/json/)
            .expect(500)
            .then((res) => {
                expect(console.error.mock.calls[0][0]).toMatch('Error: There are no entries to map. You might want to check the __NEXT_ROUTES__ global variable.'); // eslint-disable-line max-len
                expect(res.body).toEqual({
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An internal server error occurred',
                });
            });
    });

    it('should log 500 errors', async () => {
        jest.spyOn(console, 'error').mockImplementation();
        handleDynamicRoutesMapping.mockImplementationOnce(() => { throw new Error('foo'); });

        const handler = setupSitemap();

        await request(enhance(handler))
            .get('/')
            .expect('Content-Type', /^application\/json/)
            .expect(500)
            .then(() => {
                expect(console.error).toHaveBeenCalledTimes(1);
                expect(console.error.mock.calls[0][0]).toMatch('Error: foo');
            });
    });

    describe('options', () => {
        it('should allow passing a custom baseUrl', async () => {
            const customBaseUrl = 'https://foo';
            const mockedSitemapEntries = ['/', '/page1', '/page2'];

            handleDynamicRoutesMapping.mockReturnValue(mockedSitemapEntries);
            generateSitemapFromEntries.mockReturnValue(mockedSitemapXml);

            const handler = setupSitemap({ baseUrl: customBaseUrl });

            await request(enhance(handler))
                .get('/')
                .expect(200)
                .then(() => {
                    expect(generateSitemapFromEntries).toHaveBeenCalledWith(mockedSitemapEntries, {
                        baseUrl: customBaseUrl,
                    });
                });
        });

        it('should allow passing a custom handleError', async () => {
            jest.spyOn(console, 'warn').mockImplementation();

            const customHandleError = jest.fn((err) => {
                console.warn(`This error message is ${err.data.originalError.message}`);
            });

            handleDynamicRoutesMapping.mockImplementationOnce(() => { throw new Error('foo'); });

            const handler = setupSitemap({ handleError: customHandleError });

            await request(enhance(handler))
                .get('/')
                .expect('Content-Type', /^application\/json/)
                .expect(500)
                .then(() => {
                    expect(customHandleError).toHaveBeenCalledTimes(1);
                    expect(console.warn).toHaveBeenCalledTimes(1);
                    expect(console.warn.mock.calls[0][0]).toEqual('This error message is foo');
                });
        });

        it('should allow passing a custom handleWarning', async () => {
            const routes = ['/page1'];

            global.__NEXT_ROUTES__ = routes;
            handleDynamicRoutesMapping.mockReturnValue(routes);
            generateSitemapFromEntries.mockReturnValue(routes);

            const customHandleWarning = jest.fn();

            const handler = setupSitemap({ handleWarning: customHandleWarning });

            await request(enhance(handler))
                .get('/')
                .expect(200)
                .then(() => {
                    expect(handleDynamicRoutesMapping).toHaveBeenCalledWith(routes, {
                        handleWarning: customHandleWarning,
                        mapDynamicRoutes: {},
                    });
                });
        });
    });
});

describe('When method is not supported', () => {
    it('should respond with 405', async () => {
        generateSitemapFromEntries.mockReturnValue(mockedSitemapXml);

        const handler = setupSitemap();

        await request(enhance(handler))
            .post('/')
            .expect(405)
            .then((res) => {
                expect(res.body).toEqual({
                    statusCode: 405,
                    error: 'Method Not Allowed',
                    message: 'Method POST is not supported for this endpoint',
                });
                // Response must include an Allow header
                expect(res.headers.allow).toEqual('GET');
            });
    });
});
