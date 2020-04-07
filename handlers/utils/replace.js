'use strict';

/**
 * Replaces dynamic routes for real values.
 *
 * @param {object} options - Options that should be used on the replacement process.
 * @param {string} options.fullEntry - The entry path that's being handled. Example: /[project]/[id]/project.
 * @param {string} options.entryToBeReplaced - The entry string that should be replaced. Example: project-one/[id]/project.
 * @param {Array<string>} options.replacements - An array containing the replacements for the group that should be replaced.
 * @param {string} options.groupThatShouldBeReplaced - Dynamic group that must be replaced. Example: /[id].
 * @param {object} options.previousMatchedReplacements - An object containing all the previous mapped routes.
 * @returns {Array<string>} - Returns mapped routes.
 */
module.exports = function (options = {}) {
    const {
        fullEntry,
        entryToBeReplaced,
        replacements,
        groupThatShouldBeReplaced,
        previousMatchedReplacements,
    } = options;

    if (!fullEntry || !entryToBeReplaced || !replacements || !groupThatShouldBeReplaced || !previousMatchedReplacements) {
        return [];
    }

    const splicedEntry = fullEntry.substr(0, fullEntry.lastIndexOf(']') + 1);
    const isDynamicFolder = splicedEntry !== fullEntry;

    const replacedGroups = replacements.reduce((acc, replacement) => {
        const value = entryToBeReplaced.replace(groupThatShouldBeReplaced, `/${replacement}`);

        acc.fullMap.push(value);

        if (isDynamicFolder) {
            const charsDifference = fullEntry.length - splicedEntry.length;

            const splicedValue = value.substr(0, value.length - charsDifference);

            acc.folderMap.push(splicedValue);
        }

        return acc;
    }, { fullMap: [], folderMap: [] });

    if (isDynamicFolder) {
        previousMatchedReplacements[splicedEntry] = previousMatchedReplacements[splicedEntry] ?
            previousMatchedReplacements[splicedEntry].concat(replacedGroups.folderMap) :
            replacedGroups.folderMap;
    }

    previousMatchedReplacements[fullEntry] = previousMatchedReplacements[fullEntry] ?
        previousMatchedReplacements[fullEntry].concat(replacedGroups.fullMap) :
        replacedGroups.fullMap;

    return replacedGroups.fullMap;
};
