'use strict';

const { replace } = require('../handlers/utils');

describe('When the required params are not passed', () => {
    it('should return an empty array', () => {
        expect(replace()).toEqual([]);
    });
});

describe('When the required params are passed', () => {
    it('should return correctly the mapped routes and add info to previousMatchedReplacements object', () => {
        const previousMatchedReplacements = {};
        const options = {
            fullEntry: '/[id]',
            entryToBeReplaced: '/[id]',
            replacements: ['id-one', 'id-two'],
            groupThatShouldBeReplaced: '/[id]',
            previousMatchedReplacements,
        };

        const entries = replace(options);

        expect(entries).toEqual(['/id-one', '/id-two']);
        expect(previousMatchedReplacements).toEqual({ '/[id]': ['/id-one', '/id-two'] });
    });

    it('should return correctly the mapped routes for dynamic folder', () => {
        const previousMatchedReplacements = {};
        const options = {
            fullEntry: '/[id]/panda',
            entryToBeReplaced: '/[id]/panda',
            replacements: ['id-one', 'id-two'],
            groupThatShouldBeReplaced: '/[id]',
            previousMatchedReplacements,
        };

        const entries = replace(options);

        expect(entries).toEqual(['/id-one/panda', '/id-two/panda']);
        expect(previousMatchedReplacements).toEqual({
            '/[id]': ['/id-one', '/id-two'],
            '/[id]/panda': ['/id-one/panda', '/id-two/panda'],
        });
    });

    it('should return correctly the mapped routes for chained dynamic routes', () => {
        const previousMatchedReplacements = {};
        const options = {
            fullEntry: '/[id]/[animal]',
            entryToBeReplaced: '/id-one/[animal]',
            replacements: ['panda', 'zebra'],
            groupThatShouldBeReplaced: '/[animal]',
            previousMatchedReplacements,
        };

        const entries = replace(options);

        expect(entries).toEqual(['/id-one/panda', '/id-one/zebra']);
        expect(previousMatchedReplacements).toEqual({ '/[id]/[animal]': ['/id-one/panda', '/id-one/zebra'] });
    });

    it('should return correctly the mapped routes for chained dynamic folder', () => {
        const previousMatchedReplacements = {};
        const options = {
            fullEntry: '/[id]/[animal]/foo',
            entryToBeReplaced: '/id-one/[animal]/foo',
            replacements: ['panda', 'zebra'],
            groupThatShouldBeReplaced: '/[animal]',
            previousMatchedReplacements,
        };

        const entries = replace(options);

        expect(entries).toEqual(['/id-one/panda/foo', '/id-one/zebra/foo']);
        expect(previousMatchedReplacements).toEqual({
            '/[id]/[animal]': ['/id-one/panda', '/id-one/zebra'],
            '/[id]/[animal]/foo': ['/id-one/panda/foo', '/id-one/zebra/foo'],
        });
    });

    it('should update properly previousMatchedReplacements object', () => {
        const previousMatchedReplacements = {
            '/[id]/[animal]': ['/id-one/panda', '/id-one/zebra'],
            '/[id]/[animal]/foo': ['/id-one/panda/foo', '/id-one/zebra/foo'],
        };
        const options = {
            fullEntry: '/[id]/[animal]/foo',
            entryToBeReplaced: '/id-two/[animal]/foo',
            replacements: ['panda', 'zebra'],
            groupThatShouldBeReplaced: '/[animal]',
            previousMatchedReplacements,
        };

        const entries = replace(options);

        expect(entries).toEqual(['/id-two/panda/foo', '/id-two/zebra/foo']);
        expect(previousMatchedReplacements).toEqual({
            '/[id]/[animal]': [
                '/id-one/panda',
                '/id-one/zebra',
                '/id-two/panda',
                '/id-two/zebra',
            ],
            '/[id]/[animal]/foo': [
                '/id-one/panda/foo',
                '/id-one/zebra/foo',
                '/id-two/panda/foo',
                '/id-two/zebra/foo',
            ],
        });
    });
});
