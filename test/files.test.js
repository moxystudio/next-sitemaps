'use strict';

const fs = require('fs');
const { buildEntriesFromFileSystem } = require('../handlers');

jest.mock('fs', () => ({
    readdirSync: jest.fn(() => []),
}));

describe('Files handler', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('When the pages directory is empty', () => {
        it('should return an empty array', () => {
            expect(buildEntriesFromFileSystem()).toEqual([]);
        });
    });

    describe('When the pages directory has an api folder', () => {
        it('should ignore it', () => {
            fs.readdirSync.mockReturnValue(['api']);

            expect(buildEntriesFromFileSystem()).toEqual([]);
        });
    });

    describe('When the pages directory has a next template file', () => {
        it('should ignore it', () => {
            fs.readdirSync.mockReturnValue(['_document', '_page', '_something']);

            expect(buildEntriesFromFileSystem()).toEqual([]);
        });
    });

    describe('When there is an index.js file', () => {
        it('should map it to the parent folder route', () => {
            fs.readdirSync.mockReturnValue(['index.js']);

            expect(buildEntriesFromFileSystem()).toEqual(['/']);
        });
    });

    describe('When there is an index.js file as a sub-folder file', () => {
        it('should map it to the parent folder route', () => {
            fs.readdirSync.mockImplementation((folder) => {
                if (folder === 'pages') {
                    return ['index.js', 'stuff'];
                }
                if (folder === 'pages/stuff') {
                    return ['index.js'];
                }

                return [];
            });

            expect(buildEntriesFromFileSystem()).toEqual(['/', '/stuff/']);
        });
    });

    describe('When there is an .js file', () => {
        it('should remove the extension and map it', () => {
            fs.readdirSync.mockReturnValue(['cool.js']);

            expect(buildEntriesFromFileSystem()).toEqual(['/cool']);
        });
    });

    describe('When there is an .js file as a sub-folder file', () => {
        it('should map it to the parent folder route', () => {
            fs.readdirSync.mockImplementation((folder) => {
                if (folder === 'pages') {
                    return ['index.js', 'panda.js', 'zebra'];
                }
                if (folder === 'pages/zebra') {
                    return ['zoo.js'];
                }

                return [];
            });

            expect(buildEntriesFromFileSystem()).toEqual(['/', '/panda', '/zebra/zoo']);
        });
    });
});
