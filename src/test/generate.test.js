import generateSitemapFromEntries from '../api-handler/generate';

const baseXML = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

describe('When entries are passed', () => {
    it('should create the xml successfully based on the passed entries', () => {
        const sitemap = generateSitemapFromEntries(['/', '/another-entry'], { baseUrl: 'https://batatas.com' });

        const expectedSitemap =
`<?xml version="1.0" encoding="UTF-8"?>
${baseXML}
<url><loc>https://batatas.com/</loc></url>
<url><loc>https://batatas.com/another-entry</loc></url>
</urlset>`;

        expect(sitemap).toEqual(expectedSitemap);
    });

    it('should throw when entries are an empty array', () => {
        const emptyGeneration = () => generateSitemapFromEntries([], { baseUrl: '/' });

        expect(emptyGeneration).toThrow('Cannot generate the sitemap with no entries');
    });
});

describe('When entries are not passed', () => {
    it('should throw an error', () => {
        const noEntriesGeneration = () => generateSitemapFromEntries(undefined, { baseUrl: '/' });

        expect(noEntriesGeneration).toThrow('Cannot generate the sitemap with no entries');
    });
});
