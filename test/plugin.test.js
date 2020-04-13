'use strict';

const glob = require('glob');
const withSitemap = require('../plugin');

jest.mock('glob', () => ({
    sync: jest.fn(() => []),
}));

beforeEach(() => {
    delete global.__NEXT_ROUTES__;
});

describe('When the pages directory is empty', () => {
    it('should throw an error', () => {
        const { webpack } = withSitemap();

        expect(webpack).toThrow('\'pages/\' directory is empty');
    });
});

describe('When there is an index.js file', () => {
    it('should map it to the parent folder route', () => {
        glob.sync.mockReturnValue(['pages/index.js']);
        const { webpack } = withSitemap();

        webpack();

        expect(global.__NEXT_ROUTES__).toEqual(['/']);
    });
});

describe('When there is an index.js file as a sub-folder file', () => {
    it('should map it to the parent folder route', () => {
        glob.sync.mockReturnValue(['pages/index.js', 'pages/stuff/index.js']);
        const { webpack } = withSitemap();

        webpack();

        expect(global.__NEXT_ROUTES__).toEqual(['/stuff/', '/']);
    });
});

describe('When there is an .js file', () => {
    it('should remove the extension and map it', () => {
        glob.sync.mockReturnValue(['pages/cool.js']);
        const { webpack } = withSitemap();

        webpack();

        expect(global.__NEXT_ROUTES__).toEqual(['/cool']);
    });
});

describe('When there is an .js file as a sub-folder file', () => {
    it('should map it to the parent folder route', () => {
        glob.sync.mockReturnValue(['pages/index.js', 'pages/panda.js', 'pages/zebra/zoo.js']);
        const { webpack } = withSitemap();

        webpack();

        expect(global.__NEXT_ROUTES__).toEqual(['/zebra/zoo', '/panda', '/']);
    });
});
