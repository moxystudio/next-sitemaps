'use strict';

const { getReplacingInfo } = require('../handlers/utils');

describe('When the required params are not passed', () => {
    it('should return an empty object', () => {
        expect(getReplacingInfo()).toEqual({});
    });
});

describe('When the required params are passed', () => {
    it('should return info correctly for dynamic path', () => {
        const options = {
            entry: '/[id]',
            replacements: ['id-one', 'id-two'],
            groupThatShouldBeReplaced: '/[id]',
        };

        const {
            splicedEntry,
            isDynamicFolder,
            replacedGroups,
        } = getReplacingInfo(options);

        expect(splicedEntry).toEqual('/[id]');
        expect(isDynamicFolder).toBeFalsy();
        expect(replacedGroups).toEqual({
            fullMap: ['/id-one', '/id-two'],
            folderMap: [],
        });
    });

    it('should return info correctly for dynamic folder', () => {
        const options = {
            entry: '/[id]/panda',
            replacements: ['id-one', 'id-two'],
            groupThatShouldBeReplaced: '/[id]',
        };

        const {
            splicedEntry,
            isDynamicFolder,
            replacedGroups,
        } = getReplacingInfo(options);

        expect(splicedEntry).toEqual('/[id]');
        expect(isDynamicFolder).toBeTruthy();
        expect(replacedGroups).toEqual({
            fullMap: ['/id-one/panda', '/id-two/panda'],
            folderMap: ['/id-one', '/id-two'],
        });
    });

    it('should return info correctly for chained dynamic path', () => {
        const options = {
            entry: '/[id]/[animal]',
            preMappedEntry: '/id-one/[animal]',
            replacements: ['panda', 'zebra'],
            groupThatShouldBeReplaced: '/[animal]',
        };

        const {
            splicedEntry,
            isDynamicFolder,
            replacedGroups,
        } = getReplacingInfo(options);

        expect(splicedEntry).toEqual('/[id]/[animal]');
        expect(isDynamicFolder).toBeFalsy();
        expect(replacedGroups).toEqual({
            fullMap: ['/id-one/panda', '/id-one/zebra'],
            folderMap: [],
        });
    });

    it('should return info correctly for chained dynamic folder', () => {
        const options = {
            entry: '/[id]/[animal]/foo',
            preMappedEntry: '/id-one/[animal]/foo',
            replacements: ['panda', 'zebra'],
            groupThatShouldBeReplaced: '/[animal]',
        };

        const {
            splicedEntry,
            isDynamicFolder,
            replacedGroups,
        } = getReplacingInfo(options);

        expect(splicedEntry).toEqual('/[id]/[animal]');
        expect(isDynamicFolder).toBeTruthy();
        expect(replacedGroups).toEqual({
            fullMap: ['/id-one/panda/foo', '/id-one/zebra/foo'],
            folderMap: ['/id-one/panda', '/id-one/zebra'],
        });
    });
});
