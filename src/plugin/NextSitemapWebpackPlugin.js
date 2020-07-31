/* istanbul ignore file */

import glob from 'glob';
import { ConcatSource } from 'webpack-sources';

class NextSitemapWebpackPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapPromise('NextSitemapPlugin', async (compilation) => {
            const diskRoutes = glob.sync('pages/**/*.@(js|jsx|mjs|ts|tsx)', { ignore: ['pages/api/**', 'pages/_*'] });

            // Remove page/ prefix, extension suffix and finally /index suffix as well.
            const routes = diskRoutes.map((diskRoute) =>
                diskRoute.replace(/^pages/, '').replace(/\.[^\\/.]+$/, '').replace(/\/index$/, ''));

            compilation.chunks
                .filter((chunk) => chunk.canBeInitial())
                .reduce((files, chunk) => {
                    files.push(...chunk.files);

                    return files;
                }, [])
                .forEach((file) => {
                    const source = `__NEXT_ROUTES__ = '${JSON.stringify(routes)}';`;

                    compilation.assets[file] = new ConcatSource(source, compilation.assets[file]);
                });
        });
    }
}

export default NextSitemapWebpackPlugin;
