# next-sitemaps

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][build-status-image]][build-status-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/@moxy/next-sitemaps
[downloads-image]:https://img.shields.io/npm/dm/@moxy/next-sitemaps.svg
[npm-image]:https://img.shields.io/npm/v/@moxy/next-sitemaps.svg
[build-status-url]:https://github.com/moxystudio/next-sitemaps/actions
[build-status-image]:https://img.shields.io/github/workflow/status/moxystudio/next-sitemaps/Node%20CI/master
[codecov-url]:https://codecov.io/gh/moxystudio/next-sitemaps
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/next-sitemaps/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/next-sitemaps
[david-dm-image]:https://img.shields.io/david/moxystudio/next-sitemaps.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/next-sitemaps?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/next-sitemaps.svg

This module provides an API handler and a plugin that enables your Next.js application to have working sitemaps so that search engine crawlers can index all your pages.

## Installation

```sh
npm install @moxy/next-sitemaps
```

## Usage

### Simple usage

**1. Add the plugin to `next.config.js`**

```js
const withSitemap = require('@moxy/next-sitemaps/plugin');

module.exports = (phase) => withSitemap(phase, 'https://moxy.studio')({ ...nextConfig });
```

> ℹ️ If you have multiple plugins, you may simply compose them or use [`next-compose-plugins`](https://github.com/cyrilwanner/next-compose-plugins) for better readability.

**2. Add the API handler on `pages/api/sitemap.xml.js`**

```js
import createSitemapApiHandler from '@moxy/next-sitemaps';

export default createSitemapApiHandler({
    mapDynamicRoutes: {
        '/[id]': () => ['id1', 'id2'],
    },
});
```

**3. Add the endpoint URL to your project's robots.txt file**

```txt
Sitemap: ${siteUrl}/api/sitemap.xml
User-agent:*
Disallow:

# ...
```

> ℹ️ `${siteUrl}` will be replaced automatically by the `siteUrl` specified when instantiating the plugin.

> ⚠️ During development, new pages will not be present in the XML. Restart the development server for page changes to take effect.

## API

### withSitemap(phase, siteUrl, [options])

The Next.js plugin that should be installed in `next.config.js`. It will do two things:

- Iterate over the `/pages` (or `src/pages`) folder and map all files into routes. These mappings will be used by the API Handler.
- Replace the `${siteUrl}` placeholder inside `robots.txt` with `siteUrl`.

#### phase

Type: `string`

The Next.js current context phase. This plugin will only be active if `phase` is `PHASE_DEVELOPMENT_SERVER` or `PHASE_PRODUCTION_BUILD`.

##### siteUrl

Type: `string`   
Default: `'/'`

The website URL.

#### options

Type: `object`

##### replaceSiteUrlInRobots

Type: `boolean`
Default: `true` if `process.env.NODE_ENV` is set to production

This option will replace `${siteUrl}` inside `robots.txt`. During development, you want this option disabled to avoid checking in the resulting file into source-control (e.g.: git).

### createSitemapApiHandler([options])

Defines an API handler that will respond with a valid sitemap XML file containing the website pages.

#### options

Type: `object`

##### mapDynamicRoutes

Type: `object`   
Default: `{}`

An object that indicates the possible values for each dynamic route. [More info](#handling-dynamic-routing).

##### cacheControl

Type: `string`   
Default: `public, max-age=3600` (max-age is set to 0 if not in production)

A string defining the [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) header for HTTP responses. Since sitemaps can be rather expensive to generate, you may leverage a [Reverse Proxy](https://en.wikipedia.org/wiki/Reverse_proxy) cache or a pull CDN such as [CloudFlare](https://www.cloudflare.com/) (via a page rule), to cache the sitemap response.

While a reverse-proxy or pull CDN is preferable, you may cache the sitemap programmatically like so:

```js
import pMemoize from 'p-memoize';
import createSitemapApiHandler from '@moxy/next-sitemaps';

const apiHandler = createSitemapApiHandler('https://moxy.studio', {
    mapDynamicRoutes: {
        '/[id]': () => ['id1', 'id2'],
    },
});

export default pMemoize(apiHandler, {
    cacheKey: () => 'sitemap',
    cachePromiseRejection: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
});
```

The example above uses [`p-memoize`](https://github.com/sindresorhus/p-memoize), which caches the result in-memory for `5 minutes`. However, you can use a distributed cache, such as Redis.

##### logWarning

Type: `function`    
Default: see `logWarningDefault` in [src/api-handler/index.js](./src/api-handler/index.js)

A function to log possible warnings. It has the following signature: `(message) => {}`.

##### logError

Type: `function`    
Default: see `logErrorDefault` in [src/api-handler/index.js](./src/api-handler/index.js)

A function to log possible errors. It has the following signature: `(err) => {}`.

### Handling dynamic routing

```js
createSitemapApiHandler('https://moxy.studio', {
    mapDynamicRoutes: {
        '/[project]': () => ['some-project', 'another-project'],
        '/old/[post]': () => ['old-post', 'ancient-post'],
        '/[post]/new': () => ['new-post', 'another-new-post'],
    },
});
```

The API route above would respond with the following XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://moxy.studio/another-project</loc>
    </url>
    <url>
        <loc>https://moxy.studio/some-project</loc>
    </url>
    <url>
        <loc>https://moxy.studio/old/old-post</loc>
    </url>
    <url>
        <loc>https://moxy.studio/old/ancient-post</loc>
    </url>
    <url>
        <loc>https://moxy.studio/new-post/new</loc>
    </url>
    <url>
        <loc>https://moxy.studio/another-new-post/new</loc>
    </url>
</urlset>
```

> ℹ️ [Catch all](https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes) routes are also supported.

You might have routes with several dynamic placeholders. In this case, first-level mappers will be called first, second-level mappers will be called secondly, one time for each result of the first mapper, and so on. In short, calls to mappers are permuted and they receive the current iteration values to aid you in data-fetching.

```js
createSitemapApiHandler('https://moxy.studio', {
    mapDynamicRoutes: {
        '/[company]': async () => {
            const companies = await fetchCompanies(); // returns ['microsoft', 'apple']

            return companies;
        },
        // The function below will be called two times.
        // The first will have `company` set microsoft and the second one will have it set to `apple`.
        '/[company]/[apps]': ({ company }) => {
            const apps = fetchCompanyApps(company); // returns ['vscode', 'vsstudio'] for microsoft and returns ['itunes'] for apple

            return apps;
        },
    },
});
```

Assuming the return values of the mappers above, the generated sitemap would look like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://moxy.studio/apple</loc>
    </url>
    <url>
        <loc>https://moxy.studio/apple/itunes</loc>
    </url>
    <url>
        <loc>https://moxy.studio/microsoft</loc>
    </url>
    <url>
        <loc>https://moxy.studio/microsoft/vscode</loc>
    </url>
    <url>
        <loc>https://moxy.studio/microsoft/vsstudio</loc>
    </url>
</urlset>
```

## Tests

```sh
$ npm t
$ npm t -- --watch  # To run watch mode
```

## License

[MIT License](./LICENSE)
