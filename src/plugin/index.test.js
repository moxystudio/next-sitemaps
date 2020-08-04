import fs from 'fs';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_EXPORT, PHASE_PRODUCTION_SERVER } from 'next/constants';
import withSitemaps from './';

const cwd = process.cwd();

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    writeFileSync: jest.fn(() => {}),
}));

jest.spyOn(fs, 'readFileSync');

afterEach(() => {
    process.chdir(cwd);
    jest.clearAllMocks();
});

it('should inject _NEXT_SITEMAPS_ env variable with the correct siteUrl and routes', () => {
    process.chdir(`${__dirname}/__fixtures__/standard`);

    const config = withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com')();

    expect(config).toEqual({
        env: {
            _NEXT_SITEMAPS_: JSON.stringify({
                siteUrl: 'http://my-site.com',
                routes: ['/contact', '', '/projects/[id]', '/projects'],
            }),
        },
    });
});

it('should trim trailing slash from siteUrl', () => {
    process.chdir(`${__dirname}/__fixtures__/standard`);

    const config = withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com/')();

    expect(config).toEqual({
        env: {
            _NEXT_SITEMAPS_: JSON.stringify({
                siteUrl: 'http://my-site.com',
                routes: ['/contact', '', '/projects/[id]', '/projects'],
            }),
        },
    });
});

it('should support pages in src/pages', () => {
    process.chdir(`${__dirname}/__fixtures__/with-src-pages`);

    const config = withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com')();

    expect(config).toEqual({
        env: {
            _NEXT_SITEMAPS_: JSON.stringify({
                siteUrl: 'http://my-site.com',
                routes: ['/contact', ''],
            }),
        },
    });
});

it('should return as is according to the phase', () => {
    const initialConfig = {};

    expect(withSitemaps(PHASE_EXPORT, 'http://my-site.com/')(initialConfig)).toBe(initialConfig);
    expect(withSitemaps(PHASE_PRODUCTION_SERVER, 'http://my-site.com/')(initialConfig)).toBe(initialConfig);

    expect(withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com/')(initialConfig)).not.toBe(initialConfig);
    expect(withSitemaps(PHASE_PRODUCTION_BUILD, 'http://my-site.com/')(initialConfig)).not.toBe(initialConfig);
});

describe('robots.txt', () => {
    it('should replace robots.txt correctly', () => {
        process.chdir(`${__dirname}/__fixtures__/standard`);

        fs.writeFileSync.mockImplementationOnce(() => {});

        withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com', { replaceSiteUrlInRobots: true })();

        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenNthCalledWith(1, 'public/robots.txt', `Sitemap: http://my-site.com

User-agent:*
Disallow:
`);
    });

    it('should not replace twice on the same instance', () => {
        process.chdir(`${__dirname}/__fixtures__/standard`);

        fs.writeFileSync.mockImplementationOnce(() => {});

        const plugin = withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com', { replaceSiteUrlInRobots: true });

        plugin();
        plugin();

        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('should throw if robots.txt does not exist', () => {
        process.chdir(`${__dirname}/__fixtures__/with-no-robots`);

        expect(() => {
            withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com', { replaceSiteUrlInRobots: true })();
        }).toThrow('It seems you forgot to create public/robots.txt');
    });

    it('should throw if reading robots.txt fails', () => {
        process.chdir(`${__dirname}/__fixtures__/with-no-robots`);

        fs.readFileSync.mockImplementationOnce(() => {
            throw new Error('foo');
        });

        expect(() => {
            withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com', { replaceSiteUrlInRobots: true })();
        }).toThrow('foo');
    });

    it('should throw if siteUrl placeholder is not present in robots.txt', () => {
        process.chdir(`${__dirname}/__fixtures__/with-missing-robots-placeholder`);

        expect(() => {
            withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com', { replaceSiteUrlInRobots: true })();
        // eslint-disable-next-line no-template-curly-in-string
        }).toThrow('It seems you forgot to use the ${siteUrl} placeholder in public/robots.txt');
    });

    it('should not throw if siteUrl is already replaced in robots.txt', () => {
        process.chdir(`${__dirname}/__fixtures__/with-robots-already-replaced`);

        withSitemaps(PHASE_DEVELOPMENT_SERVER, 'http://my-site.com', { replaceSiteUrlInRobots: true })();

        expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
    });
});
