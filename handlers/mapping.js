'use strict';

const { getReplacingInfo } = require('./utils');

const previousMatchedReplacements = {};

/**
 * Maps the dynamic routes available with the handlers specified in the options.
 *
 * @param {Array<string>} entries - The entries (path) that must be handled. Example: ['/home', '/[page]/id'].
 * @param {object} options - The options that should be used to map and handle warnings.
 * @param {Function} options.handleWarning - A function to be called when an warning occurs.
 * @param {object<string, Function>} options.mapDynamicRoutes - An object containing information of how to handle a certain dynamic route.
 * @returns {Array<string>} - Returns an array of modified entries.
 */
module.exports = async function handleDynamicRoutesMapping(entries, { handleWarning, mapDynamicRoutes }) {
    const unmappedEntries = [];
    const mappedEntries = [];

    await entries.reduce(async (prevPromise, entry) => {
        await prevPromise;

        return (async () => {
            const dynamicGroups = entry.match(/\[([^\\[\]]+)\]/g);

            if (!dynamicGroups) {
                mappedEntries.push(entry);

                return;
            }

            const mappingKeys = Object.keys(mapDynamicRoutes);

            if (!mappingKeys.includes(entry)) {
                unmappedEntries.push(entry);

                return;
            }

            // Handle /[example] and /xxx/[project]
            if (dynamicGroups.length === 1) {
                const replacements = await mapDynamicRoutes[entry]();

                const {
                    splicedEntry,
                    isDynamicFolder,
                    replacedGroups,
                } = getReplacingInfo({ entry, replacements, groupThatShouldBeReplaced: `/${dynamicGroups[0]}` });

                if (isDynamicFolder) {
                    previousMatchedReplacements[splicedEntry] = replacedGroups.folderMap;
                }
                previousMatchedReplacements[entry] = replacedGroups.fullMap;

                mappedEntries.push(...replacedGroups.fullMap);

                return;
            }

            // Handle /[example]/[project] and so on
            const groupThatShouldBeReplaced = `/${dynamicGroups.pop()}`;

            const previousDynamicGroup = entry.substr(0, entry.indexOf(groupThatShouldBeReplaced));

            const previousDynamicResult = previousMatchedReplacements[previousDynamicGroup];

            if (!previousDynamicResult) {
                console.error(`You haven't mapped the ${previousDynamicGroup} route yet!`);

                return;
            }

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

                    const {
                        splicedEntry,
                        isDynamicFolder,
                        replacedGroups,
                    } = getReplacingInfo({ entry, preMappedEntry, replacements, groupThatShouldBeReplaced });

                    if (isDynamicFolder) {
                        previousMatchedReplacements[splicedEntry] = previousMatchedReplacements[splicedEntry] ?
                            previousMatchedReplacements[splicedEntry].concat(replacedGroups.folderMap) :
                            replacedGroups.folderMap;
                    }

                    previousMatchedReplacements[entry] = previousMatchedReplacements[entry] ?
                        previousMatchedReplacements[entry].concat(replacedGroups.fullMap) :
                        replacedGroups.fullMap;

                    mappedEntries.push(...replacedGroups.fullMap);
                })();
            }, Promise.resolve());
        })();
    }, Promise.resolve());

    if (unmappedEntries.length) {
        handleWarning(`WARNING: There are unmapped dynamic routes: ${unmappedEntries}`);
    }

    return mappedEntries;
};
