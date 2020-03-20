'use strict';

const previousMatchedReplacements = {};

/**
 * Maps the dynamic routes available with the handlers specified in the config.
 *
 * @param {string} entry - The entry path that's being handled. Example: /home and /[page]/id.
 * @param {object} options - The options that should be used to map and handle warnings.
 * @param {Function} options.handleWarning - A function to be called when an warning occurs.
 * @param {object<string, Function>} options.mapDynamicRoutes - An object containing information of how to handle a certain dynamic route.
 * @returns {string|null|Array<string>} - Returns null if it should be removed. Can return an modified entry or an array of modified entries.
 */
module.exports = function handleDynamicRoutesMapping(entry, { handleWarning, mapDynamicRoutes }) {
    const dynamicGroups = entry.match(/\[([^\\[\]]+)\]/g);

    if (!dynamicGroups) {
        return entry;
    }

    const mappingKeys = Object.keys(mapDynamicRoutes);

    if (!mappingKeys.includes(entry)) {
        handleWarning(`WARNING: There's an unmapped dynamic route: ${entry}`);

        return null;
    }

    // Handle /[example] and /xxx/[project]
    if (dynamicGroups.length === 1) {
        const replacements = mapDynamicRoutes[entry]();

        const replacedGroups = replacements.map((replacement) => entry.replace(/\[(.*)\]/g, replacement));

        previousMatchedReplacements[entry] = replacedGroups;

        return replacedGroups;
    }

    const groupThatShouldBeReplaced = `/${dynamicGroups.pop()}`;

    const previousDynamicGroup = entry.substr(0, entry.indexOf(groupThatShouldBeReplaced));

    const previousDynamicResult = previousMatchedReplacements[previousDynamicGroup];

    if (!previousDynamicResult) {
        console.error(`You haven't mapped the ${previousDynamicGroup} route yet!`);

        return null;
    }

    return [].concat(...previousDynamicResult.map((previousResult) => {
        const name = previousDynamicGroup.replace('/[', '').replace(']', '');

        const replacements = mapDynamicRoutes[entry]({
            [name]: previousResult,
        });

        const mappedEntry = entry.replace(`/[${name}]`, previousResult);

        return replacements.map((replacement) => mappedEntry.replace(groupThatShouldBeReplaced, replacement));
    }));
};
