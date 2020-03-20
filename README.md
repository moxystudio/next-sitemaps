# next-sitemaps-plugin

[![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url]

[travis-url]:https://travis-ci.org/moxystudio/next-sitemaps-plugin
[travis-image]:https://img.shields.io/travis/moxystudio/next-sitemaps-plugin/master.svg
[codecov-url]:https://codecov.io/gh/moxystudio/next-sitemaps-plugin
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/next-sitemaps-plugin/master.svg

## Usage

### Simple usage

```js
withPlugins([
    //other plugins..
    withSitemaps()
    //other plugins...
])
```

You can also specify options to this plugin:

| Parameter         | Default                | Links                |
|:-------------|:--------------------------:|--------------------------:|
| baseUrl           | `/`                   | [More info](#specifying-the-base-url)
| sitemapsLocation  | `public/sitemaps.xml` | [More info](#specifying-the-target-location)
| mapDynamicRoutes  | `null`                | [More info](#handling-dynamic-routing)

### Specifying the base url

```js
withSitemaps({
    baseUrl: 'https://moxy.studio'
}),
```

### Specifying the target location

```js
withSitemaps({
    sitemapsLocation: 'www/custom-public-folder/sitemaps.xml'
}),
```

### Handling dynamic routing

```js
withSitemaps({
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

### Chained dynamic routing

There's also the option of chaining dynamic routes.

This works with pattern matching, and you also receive the previously generated results to assist your mappings.

```js
withSitemaps({
    baseUrl: 'https://app-finder.blabla',
    mapDynamicRoutes: {
        '/[company]': () => fetchCompanies(), // returns ['microsoft', 'apple']
        '/[company]/[apps]': ({ company }) => fetchCompanyApps(company),
    },
}),
```

Assuming that fetchCompanyApps returns "VSCode" and "VSStudio" for Microsoft and "iTunes" for Apple,
the above snippet creates the following routes:


* https://app-finder.blabla/microsoft
* https://app-finder.blabla/apple

--- 

* https://app-finder.blabla/microsoft/VSCode
* https://app-finder.blabla/microsoft/VSStudio
* https://app-finder.blabla/apple/iTunes


## License

[MIT License](./LICENSE)
