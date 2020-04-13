'use strict';

const baseXML = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

/**
 * Generates a sitemaps file from an array of entries.
 *
 * @param {Array} entries - An array of entries to build the sitemap.
 * @param {object} options - The options object that contains overridable information.
 * @param {object<string>} options.baseUrl - The base url to be used in the sitemap. Every url will be prefixed with it.
 * @returns {string} - Returns the xml formatted sitemap.
 */
module.exports = function (entries, { baseUrl }) {
    if (!entries || entries.length === 0) {
        throw new Error('Cannot generate the sitemap with no entries');
    }

    const urlEntries = entries.reduce((acc, entry) => {
        const newEntry = `<url><loc>${baseUrl}${entry}</loc></url>`;
        const finalEntry = acc === '' ? newEntry : `\n${newEntry}`;

        return acc.concat(finalEntry);
    }, '');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
${baseXML}
${urlEntries}
</urlset>`;

    return sitemap;
};
