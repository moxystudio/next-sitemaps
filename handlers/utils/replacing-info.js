'use strict';

/**
 * Builds info related to the replacement.
 *
 * @param {object<string, string, Array<string>, string>} options - Options that should be used to create the info.
 * @param {string} options.entry - The entry path that's being handled.
 * @param {string} options[.preMappedEntry] - Path already pre-mapped. This param is optional.
 * @param {Array<string>} options.replacements - An array containing the replacements for the current entry.
 * @param {string} options.groupThatShouldBeReplaced - Dynamic group that must be replaced. Example: /[project].
 * @returns {object<string, bool, Array<string>>} - Returns info related to the replacement.
 */
const defaultOptions = {
    entry: undefined,
    replacements: undefined,
    groupThatShouldBeReplaced: undefined,
};

module.exports = function (options = defaultOptions) {
    const { entry, preMappedEntry, replacements, groupThatShouldBeReplaced } = options;

    if (!entry || !replacements || !groupThatShouldBeReplaced) {
        return {};
    }

    const splicedEntry = entry.substr(0, entry.lastIndexOf(']') + 1);
    const isDynamicFolder = splicedEntry !== entry;

    const replacedGroups = replacements.reduce((acc, replacement) => {
        const entryToReplace = preMappedEntry ? preMappedEntry : entry;
        const value = entryToReplace.replace(groupThatShouldBeReplaced, `/${replacement}`);

        acc.fullMap.push(value);

        if (isDynamicFolder) {
            const charsDifference = entry.length - splicedEntry.length;

            const splicedValue = value.substr(0, value.length - charsDifference);

            acc.folderMap.push(splicedValue);
        }

        return acc;
    }, { fullMap: [], folderMap: [] });

    return {
        splicedEntry,
        isDynamicFolder,
        replacedGroups,
    };
};
