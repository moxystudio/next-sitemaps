'use strict';

const fs = require('fs');
const dynamicFileRegex = /^\[(.*)\].js$/;
const dynamicFolderRegex = /\[(.*)\]/g;

module.exports = (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config, options) {
        const {
            handleDynamicFile,
            handleDynamicFolder,
            sitemapsLocation = 'public/sitemaps.xml',
            baseUrl = '/',
        } = options.config;

        const sitemapEntries = [];

        const buildFolderSitemapEntries = (folderItem, parentFolder = '/') => {
            if (/^_/g.test(folderItem)) {
                return;
            }
            if (folderItem === 'index.js') {
                return sitemapEntries.push(parentFolder);
            }

            const regexResult = dynamicFileRegex.exec(folderItem);

            if (regexResult && handleDynamicFile) {
                const name = regexResult[1];

                const replacementFiles = handleDynamicFile(name, parentFolder);

                if (Array.isArray(replacementFiles)) {
                    return replacementFiles.map((file) => `${parentFolder}${file}`).map((file) => sitemapEntries.push(file));
                }

                return sitemapEntries.push(`${parentFolder}${folderItem}`);
            }

            if (/.js$/g.test(folderItem)) {
                return sitemapEntries.push(
          `${parentFolder}${folderItem.replace('.js', '')}`
                );
            }

            try {
                fs.readdirSync(`pages/${parentFolder}${folderItem}`).map((subItem) =>
                    buildFolderSitemapEntries(subItem, `${parentFolder}${folderItem}/`)
                );
            } catch (e) {
                console.error(e.message);
            }
        };

        const pagesDir = fs.readdirSync('pages').filter((page) => page !== 'api');

        pagesDir.forEach((page) => buildFolderSitemapEntries(page));

        const writableEntries = sitemapEntries
        .concat()
        .sort()
        .map((entry) => {
            if (!handleDynamicFolder) {
                return entry;
            }

            const regexResult = dynamicFolderRegex.exec(entry);

            if (!regexResult) {
                return entry;
            }

            const name = regexResult[1];
            const replaceFunction = handleDynamicFolder[name];

            if (!replaceFunction) {
                return entry.replace(dynamicFolderRegex, name);
            }

            const dynamicFolderReplacer = replaceFunction(name);

            return entry.replace(dynamicFolderRegex, dynamicFolderReplacer);
        })
        .map((entry) => `<url><loc>${baseUrl}${entry}</loc></url>`);

        const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${
            writableEntries.join('\n')
        }</urlset>`;

        fs.unlinkSync(sitemapsLocation);

        fs.appendFileSync(sitemapsLocation, sitemap);

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});
