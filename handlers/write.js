'use strict';

const fs = require('fs');
const baseXML = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

/**
 * Writes an array of entries into a sitemaps file.
 *
 * @param {Array} entries - An array of entries to write into the file.
 * @param {Object} options - The options object that contains overridable information.
 * @param {Object.string} options.baseUrl - The base url to be used in the sitemap. Every url will be prefixed with it.
 * @param {Object.string} options.sitemapsLocation - The location of where you want the file to be saved to.
 */
module.exports = function (entries, { baseUrl, sitemapsLocation }) {
    const writableEntries = entries.map((entry) => `<url><loc>${baseUrl}${entry}</loc></url>`);

    const sitemap = `${baseXML}\n${writableEntries.join('\n')}\n</urlset>`;

    fs.writeFileSync(sitemapsLocation, sitemap);
};

