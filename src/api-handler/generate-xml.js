const generateXml = (urls) => {
    const entries = urls.reduce((acc, url) => {
        const entry = `<url><loc>${url}</loc></url>`;

        return acc.concat(acc === '' ? entry : `\n${entry}`);
    }, '');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

    return sitemap;
};

export default generateXml;
