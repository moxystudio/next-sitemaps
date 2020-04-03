'use strict';

const glob = require('glob');
const { getExistingEntries } = require('../handlers');

jest.mock('glob', () => ({
    sync: jest.fn(() => []),
}));

afterEach(() => {
    jest.resetAllMocks();
});

describe('When the pages directory is empty', () => {
    it('should throw an error', () => {
        expect(() => getExistingEntries()).toThrow('\'pages/\' directory is empty');
    });
});

describe('When there is an index.js file', () => {
    it('should map it to the parent folder route', () => {
        glob.sync.mockReturnValue(['pages/index.js']);

        expect(getExistingEntries()).toEqual(['/']);
    });
});

describe('When there is an index.js file as a sub-folder file', () => {
    it('should map it to the parent folder route', () => {
        glob.sync.mockReturnValue(['pages/index.js', 'pages/stuff/index.js']);

        expect(getExistingEntries()).toEqual(['/stuff/', '/']);
    });
});

describe('When there is an .js file', () => {
    it('should remove the extension and map it', () => {
        glob.sync.mockReturnValue(['pages/cool.js']);

        expect(getExistingEntries()).toEqual(['/cool']);
    });
});

describe('When there is an .js file as a sub-folder file', () => {
    it('should map it to the parent folder route', () => {
        glob.sync.mockReturnValue(['pages/index.js', 'pages/panda.js', 'pages/zebra/zoo.js']);

        expect(getExistingEntries()).toEqual(['/zebra/zoo', '/panda', '/']);
    });
});
