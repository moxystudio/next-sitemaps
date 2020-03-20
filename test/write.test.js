import fs from 'fs';
import { writeEntriesToSitemap } from '../handlers';

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
}));

const baseXML = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

describe('Write handler', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should map the entries into xml', () => {
        writeEntriesToSitemap(['/'], {
            baseUrl: 'https://batatas.com',
            sitemapsLocation: 'some-location',
        });

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            'some-location',
            `${baseXML}
<url><loc>https://batatas.com/</loc></url>
</urlset>`,
        );

        writeEntriesToSitemap(['/', '/another-entry'], {
            baseUrl: 'https://batatas.com',
            sitemapsLocation: 'some-location',
        });

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            'some-location',
            `${baseXML}
<url><loc>https://batatas.com/</loc></url>
<url><loc>https://batatas.com/another-entry</loc></url>
</urlset>`,
        );
    });
});
