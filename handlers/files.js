'use strict';

const glob = require('glob');

/**
 * Matches all files and directories inside the next's pages folder and maps them into urls.
 * The api folder and the template pages (_document, _error, etc) are ignored.
 *
 * @returns {Array} An array of mapped files and folders (sorted alphabetically in descending order) into possible urls.
 */
module.exports = function getExistingEntries() {
    const diskRoutes = glob.sync('pages/**/*.js', { ignore: ['pages/api/**', 'pages/_*.js'] });

    if (diskRoutes.length === 0) {
        throw new Error('\'pages/\' directory is empty');
    }

    const routes = diskRoutes.map((diskRoute) => {
        const route = diskRoute.replace(/^pages/, '').replace(/.js$/, '');

        return route.replace('index', '');
    });

    return routes.sort().reverse();
};
