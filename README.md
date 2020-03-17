# next-sitemaps-plugin

## Usage

Simple usage:

```js
withPlugins([
    //other plugins..
    withSitemaps()
    //other plugins...
])
```

Handling dynamic routing:

```js
withSitemaps({
    handleDynamicFileSitemap: (dynamicFileName) => `moxy-${dynamicFileName}`,
    handleDynamicFolderSitemap: (dynamicFolderName, parentFoldersPath) => `moxy-${dynamicFolderName}`,
}),
```

Changing the target location:

```js
withSitemaps({
    sitemapsLocation: 'www/moxy-public-folder/sitemaps.xml'
}),
```

Changing the base url:

```js
withSitemaps({
    baseUrl: 'https://moxy.studio'
}),
```
