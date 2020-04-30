import glob from 'glob';
import { ConcatSource } from 'webpack-sources';

class NextSitemapWebpackPlugin {
    /**
     * Matches all files and directories inside the next's pages folder and maps them into urls.
     * These urls will be available through a global named __NEXT_ROUTES__.
     * The api folder and the template pages (_document, _error, etc) are ignored.
     *
     * @param {object} compiler - Webpack compiler.
     */
    apply(compiler) {
        compiler.hooks.emit.tapPromise('NextSitemapPlugin', async (compilation) => {
            const diskRoutes = glob.sync('pages/**/*.js', { ignore: ['pages/api/**', 'pages/_*.js'] });

            if (diskRoutes.length === 0) {
                throw new Error('\'pages/\' directory is empty');
            }

            const routes = diskRoutes.map((diskRoute) => {
                const route = diskRoute.replace(/^pages/, '').replace(/.js$/, '');

                return route.replace('index', '');
            }).sort().reverse();

            compilation.chunks
                .filter((chunk) => chunk.canBeInitial())
                .reduce((files, chunk) => {
                    files.push(...chunk.files);

                    return files;
                }, [])
                .forEach((file) => {
                    const nextRoutes = `__NEXT_ROUTES__ = "${routes}";`;

                    compilation.assets[file] = new ConcatSource(nextRoutes, compilation.assets[file]);
                });
        });
    }
}

export default NextSitemapWebpackPlugin;
