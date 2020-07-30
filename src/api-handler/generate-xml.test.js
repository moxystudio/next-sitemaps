import generateSitemapFromEntries from './generate-xml';

it('should create the xml successfully based on the urls', () => {
    const sitemap = generateSitemapFromEntries([
        'https://my-site.com/',
        'https://my-site.com/another-entry',
    ]);

    const expectedSitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://my-site.com/</loc></url>
<url><loc>https://my-site.com/another-entry</loc></url>
</urlset>`;

    expect(sitemap).toEqual(expectedSitemap);
});
