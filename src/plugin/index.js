import fs from 'fs';
import glob from 'glob';
import { CLIENT_PUBLIC_FILES_PATH, PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants';

const replaceRobots = (siteUrl) => {
    const file = `${CLIENT_PUBLIC_FILES_PATH}/robots.txt`;
    let contents;

    try {
        contents = fs.readFileSync(file).toString();
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`It seems you forgot to create ${file}`);
        }

        throw err;
    }

    /* eslint-disable no-template-curly-in-string */
    if (!contents.includes('${siteUrl}')) {
        if (!contents.includes(siteUrl)) {
            throw new Error(`It seems you forgot to use the \${siteUrl} placeholder in ${file}`);
        }

        return;
    }
    /* eslint-enable no-template-curly-in-string */

    const newContents = contents.replace(/\$\{siteUrl\}/g, siteUrl);

    fs.writeFileSync(file, newContents);
};

const getRoutes = () => {
    const pagesPath = fs.existsSync('pages') ? 'pages' : 'src/pages';
    const diskRoutes = glob.sync(`${pagesPath}/**/*.@(js|jsx|mjs|ts|tsx)`, { ignore: [`${pagesPath}/api/**`, `${pagesPath}/_*`] });

    // Remove page/ prefix, extension suffix and finally /index suffix as well.
    return diskRoutes.map((diskRoute) =>
        diskRoute.substr(pagesPath.length).replace(/\.[^\\/.]+$/, '').replace(/\/index$/, ''));
};

const withSitemap = (phase, siteUrl, options) => {
    if (phase !== PHASE_DEVELOPMENT_SERVER && phase !== PHASE_PRODUCTION_BUILD) {
        return (nextConfig) => nextConfig;
    }

    siteUrl = siteUrl.replace(/\/+$/, '');
    options = {
        replaceSiteUrlInRobots: process.env.NODE_ENV === 'production',
        ...options,
    };

    let replaced = false;

    return (nextConfig = {}) => {
        const routes = getRoutes();

        // Only replace robots.txt once..
        // When running the development server, this function runs twice on the same process.
        if (options.replaceSiteUrlInRobots && !replaced) {
            replaceRobots(siteUrl);
            replaced = true;
        }

        return {
            ...nextConfig,
            env: {
                ...nextConfig.env,
                _NEXT_SITEMAPS_: JSON.stringify({ siteUrl, routes }),
            },
        };
    };
};

export default withSitemap;
