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
const withPlugins = require('next-compose-plugins');
const withSitemap = require('@moxy/next-sitemaps/plugin');

withPlugins([
    // other plugins..
    withSitemap(),
    // other plugins...
]);
```

**2. Add the API handler on `pages/api/sitemap.js`**

```js
import createSitemapApiHandler from '@moxy/next-sitemaps';

export default createSitemapApiHandler({
    baseUrl: 'https://moxy.studio',
    mapDynamicRoutes: {
        '/[id]': () => ['id1', 'id2'],
    },
});
```

**3. Add the endpoint URL to your project's robots.txt file**

```txt
Sitemap: https://moxy.studio/api/sitemap
User-agent:*
Disallow:

# ...
```

ℹ️ Please note that Sitemap URL must be an absolute URL.

## API

### withSitemap()

This plugin will match all files and directories inside the next's `/pages` folder and it will map them into URLs. Those mappings will be injected in a global variable called  `__NEXT_ROUTES__`, which will be picked by the API handler.

### createSitemapApiHandler([options])

Defines an API handler that will respond with a valid sitemap XML file containing the website pages.

#### options

Type: `object`

##### baseUrl

Type: `string`  
Default: `'/'`

The website base URL, which will be used to prefix all page pathnames. Please check [Specifying the base URL](#specifying-the-base-url) for more info.

##### mapDynamicRoutes

Type: `object`  
Default: `{}`

An object that indicates the possible values for each dynamic route. [More info](#handling-dynamic-routing).

##### logWarning

Type: `function`    
Default: see `logWarningDefault` in [src/api-handler/index.js](./src/api-handler/index.js)

A function that handle possible warnings. It has the following signature: `(message) => {}`. [More info](#specifying-a-custom-warning-function).

##### logError

Type: `function`    
Default: see `logErrorDefault` in [src/api-handler/index.js](./src/api-handler/index.js)

A function that handle possible errors. It has the following signature: `(err) => {}`. [More info](#specifying-a-custom-error-function).

### Specifying the base url

```js
createSitemapApiHandler({
    baseUrl: 'https://moxy.studio'
});
```

### Handling dynamic routing

```js
createSitemapApiHandler({
    baseUrl: 'https://moxy.studio',
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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

### Chained dynamic routing

There's also the option of chaining dynamic routes.

This works with pattern matching, and you also receive the previously generated results to assist your mappings.

```js
createSitemapApiHandler({
    baseUrl: 'https://app-finder.blabla',
    mapDynamicRoutes: {
        '/[company]': async () => {
            const companies = await fetchCompanies(); // returns ['microsoft', 'apple']

            return companies;
        },
        '/[company]/[apps]': ({ company }) => {
            const apps = fetchCompanyApps(company); // Returns ['vscode', 'vsstudio'] for microsoft and returns ['itunes'] for apple

            return apps;
        },
    },
});
```

Assuming that fetchCompanyApps returns `vscode` and `vsstudio` for Microsoft and `itunes` for Apple, the API route above would respond with the following XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
        <loc>https://app-finder.blabla/apple</loc>
    </url>
    <url>
        <loc>https://app-finder.blabla/apple/itunes</loc>
    </url>
    <url>
        <loc>https://app-finder.blabla/microsoft</loc>
    </url>
    <url>
        <loc>https://app-finder.blabla/microsoft/vscode</loc>
    </url>
    <url>
        <loc>https://app-finder.blabla/microsoft/vsstudio</loc>
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
