'use strict';

const { replace } = require('./utils');

const previousMatchedReplacements = {};
const unmappedEntries = [];
const mappedEntries = [];

/**
 * Maps the specified entry with the handlers specified in the options.
 *
 * @param {string} entry - The entry to be mapped. Example: '/[page]/id'.
 * @param {object} options - The options that should be used to map and handle warnings.
 * @param {object<string, Function>} options.mapDynamicRoutes - An object containing information of how to map a certain dynamic route.
 * @returns {Promise<Array>} - Returns a promise that resolves with an array of mapped routes for the specific entry.
 */
async function mapDynamicRoute(entry, { mapDynamicRoutes }) {
    const dynamicGroups = entry.match(/\[([^\\[\]]+)\]/g);

    if (!dynamicGroups) {
        return [entry];
    }

    const mappingKeys = Object.keys(mapDynamicRoutes);

    if (!mappingKeys.includes(entry)) {
        unmappedEntries.push(entry);

        return;
    }

    // Handle /[example] and /xxx/[project]
    if (dynamicGroups.length === 1) {
        const replacements = await mapDynamicRoutes[entry]();

        return replace({
            fullEntry: entry,
            entryToBeReplaced: entry,
            replacements,
            groupThatShouldBeReplaced: `/${dynamicGroups.pop()}`,
            previousMatchedReplacements,
        });
    }

    // Handle /[example]/[project] and so on
    const groupThatShouldBeReplaced = `/${dynamicGroups.pop()}`;

    const previousDynamicGroup = entry.substr(0, entry.indexOf(groupThatShouldBeReplaced));

    if (!previousMatchedReplacements[previousDynamicGroup]) {
        await mapDynamicRoute(previousDynamicGroup, { mapDynamicRoutes });
    }

    const previousDynamicResult = previousMatchedReplacements[previousDynamicGroup];

    if (!previousDynamicResult) {
        unmappedEntries.push(previousDynamicGroup);

        return;
    }

    const newMappedEntries = [];

    await previousDynamicResult.reduce(async (prevPromise, result) => {
        await prevPromise;

        return (async () => {
            const prevDynGroupPaths = previousDynamicGroup.replace(/(\[|\])/g, '').split('/');
            const results = result.split('/');
            const prevMappedValues = prevDynGroupPaths.reduce((acc, prevDynGroupPath, index) => {
                if (prevDynGroupPath === '') { return acc; }

                acc[prevDynGroupPath] = results[index];

                return acc;
            }, {});

            const replacements = await mapDynamicRoutes[entry](prevMappedValues);

            const preMappedEntry = entry.replace(previousDynamicGroup, result);

            const newEntries = replace({
                fullEntry: entry,
                entryToBeReplaced: preMappedEntry,
                replacements,
                groupThatShouldBeReplaced,
                previousMatchedReplacements,
            });

            newMappedEntries.push(...newEntries);
        })();
    }, Promise.resolve());

    return newMappedEntries;
}

/**
 * Maps the dynamic routes available with the handlers specified in the options.
 *
 * @param {Array<string>} entries - The entries (path) that must be handled. Example: ['/home', '/[page]/id'].
 * @param {object} options - The options that should be used to map and handle warnings.
 * @param {Function} options.handleWarning - A function to be called whenever an entry is not mapped.
 * @param {object<string, Function>} options.mapDynamicRoutes - An object containing information of how to handle a certain dynamic route.
 * @returns {Promise<Array>} - Returns a promise that resolves with an array of all mapped routes.
 */
module.exports = async function handleDynamicRoutesMapping(entries, { handleWarning, ...options }) {
    const lastNewEntries = await entries.reduce(async (prevPromise, entry) => {
        const newEntries = await prevPromise;

        newEntries && mappedEntries.push(...newEntries);

        return mapDynamicRoute(entry, options);
    }, Promise.resolve());

    lastNewEntries && mappedEntries.push(...lastNewEntries);

    if (unmappedEntries.length) {
        const warningMessage = unmappedEntries.reduce((acc, unmappedEntry) => acc.concat(`\n${unmappedEntry}`),
            'WARNING: There are unmapped dynamic routes:');

        handleWarning(warningMessage);
    }

    return mappedEntries;
};
