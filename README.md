# next-sitemaps

[![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url]

[travis-url]:https://travis-ci.org/moxystudio/next-sitemaps-plugin
[travis-image]:https://img.shields.io/travis/moxystudio/next-sitemaps-plugin/master.svg
[codecov-url]:https://codecov.io/gh/moxystudio/next-sitemaps-plugin
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/next-sitemaps-plugin/master.svg

This module is an API handler that enables your next.js application to have working sitemaps so that search engine crawlers can index all your pages.

## Installation

```cmd
npm install @moxy/next-sitemaps
```

## Usage

### Simple usage

In `pages/api/sitemap.js`

```js
import setupSitemap from '@moxy/next-sitemaps';

export default setupSitemap({
    baseUrl: 'https://moxy.studio',
    mapDynamicRoutes: {
        '/[id]': () => ['id1', 'id2'],
    },
});
```

## API

### setupSitemap([options])

Defines an API handler that will send a mapped sitemap.xml.

#### options

Type: `object`

##### baseUrl

Type: `string`
Default: `'/'`

The website url to join on each sitemap entry. [More info](#specifying-the-base-url).

##### mapDynamicRoutes

Type: `object`
Default: `{}`

An object that indicates the possible values for each dynamic route. [More info](#handling-dynamic-routing).

##### handleWarning

Type: `function`
Default: see `*handleWarningDefault*` in [index.js](./index.js)

A function that handle possible warnings. It has the following signature: `(message) => {}`. [More info](#specifying-a-custom-warning-function).

##### handleError

Type: `function`
Default: see `*handleErrorDefault*` in [index.js](./index.js)

A function that handle possible errors. It has the following signature: `(err) => {}`. [More info](#specifying-a-custom-error-function).

### Specifying the base url

```js
setupSitemap({
    baseUrl: 'https://moxy.studio'
}),
```

### Handling dynamic routing

```js
setupSitemap({
    baseUrl: 'https://moxy.studio',
    mapDynamicRoutes: {
        '/[project]': () => ['some-project', 'another-project'],
        '/old/[post]': () => ['old-post', 'ancient-post'],
        '/[post]/new': () => ['new-post', 'another-new-post'],
    },
}),
```

The above snippet creates the following routes:

* https://moxy.studio/some-project
* https://moxy.studio/another-project

---

* https://moxy.studio/old/old-post
* https://moxy.studio/old/ancient-post

---

* https://moxy.studio/new-post/new
* https://moxy.studio/another-new-post/new

### Specifying a custom warning function

```js
setupSitemap({
    baseUrl: 'https://moxy.studio',
    handleWarning: (message) => {
        // do stuff here
    },
})
```

### Specifying a custom error function

```js
setupSitemap({
    baseUrl: 'https://moxy.studio',
    handleError: (error) => {
        // do stuff here
    },
})
```

### Chained dynamic routing

There's also the option of chaining dynamic routes.

This works with pattern matching, and you also receive the previously generated results to assist your mappings.

```js
setupSitemap({
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
}),
```

Assuming that fetchCompanyApps returns `vscode` and `vsstudio` for Microsoft and `itunes` for Apple,
the above snippet creates the following routes:

* https://app-finder.blabla/microsoft
* https://app-finder.blabla/apple

---

* https://app-finder.blabla/microsoft/vscode
* https://app-finder.blabla/microsoft/vsstudio
* https://app-finder.blabla/apple/itunes

## Tests

```sh
$ npm t
$ npm t -- --watch  # To run watch mode
```

## License

[MIT License](./LICENSE)
