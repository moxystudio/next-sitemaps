'use strict';

const fs = require('fs');

/**
 * Reads all files and directories inside the next's pages folder and maps them into urls.
 *
 * @param {Array} sitemapEntries - An array of entries already handled.
 * @param {string} file - A string referring to a file or folder.
 * @param {string} [parentFolder='/'] - The previous folder that was handled before the current file.
 * @returns {Array} An array of mapped files and folders into possible urls.
 */
function buildFolderSitemapEntries(sitemapEntries, file, parentFolder = '/') {
    if (/^_/g.test(file)) {
        return sitemapEntries;
    }

    if (file === 'index.js') {
        return sitemapEntries.concat(parentFolder);
    }

    if (/.js$/g.test(file)) {
        return sitemapEntries.concat(
                    `${parentFolder}${file.replace('.js', '')}`
        );
    }

    try {
        return [].concat(
            ...fs.readdirSync(`pages${parentFolder}${file}`).map((subItem) =>
                buildFolderSitemapEntries(sitemapEntries, subItem, `${parentFolder}${file}/`)
            ));
    } catch (e) {
        console.error(e.message);
    }
}

/**
 * Reads all files and directories inside the next's pages folder and maps them into urls.
 * The api folder and the template pages (_document, _error, etc) are ignored.
 *
 * @returns {Array} An array of pages and files mapped to URLs.
 */
module.exports = function () {
    const pagesDir = fs.readdirSync('pages').filter((page) => page !== 'api');

    return pagesDir.reduce((prev, page) => buildFolderSitemapEntries(prev, page), []);
};

