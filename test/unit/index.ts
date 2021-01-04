import { expect } from "chai";

import sortGlob from '../../src';

describe('sort', function() {
    it('sorts many things properly', function() {
        const input = [
            'foo/**',
            'foo-bar',
            '*-bar',
            '**-bar',
            '*/bar',
            'foo/*',
            'foo',
            'a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/0/1/2/3/4/5/6/7/8/9',
            'foo/bar/*/biz',
            'z-*-foo-*',
            'foo/**/biz',
            '*/biz/bar/**/foo/*/biz',
            'fiz/*',
            'foo/biz/*/buz',
            'foo-*',
            'foo/*/biz',
            '*/biz/foo/*/biz',
            'biz/foo-bar/*/lorum',
            'fiz/*/biz/*',
            'foo/biz/*/biz',
            '*/bar/*/biz',
            'foo-b?r',
            '*/biz/bar/**/*/*/biz',
            'biz/*/*/lorum',
            '**',
            'foo/bar',
            '*/biz/*/buz',
            'buz/foo/biz',
            '**/biz',
            '*/biz/*/*/biz',
            'biz/*-bar/*/lorum',
            'biz/foo/*/lorum',
            '*/biz/*/biz/**',
            '*/biz/x/y/z/a/b/c/*/biz/**',
            '*',
            'biz/**/biz/**/x',
        ];

        expect(sortGlob(input)).to.deep.equal([
            '**',
            '*',
            '**-bar',
            'z-*-foo-*',
            '*-bar',
            'foo-*',
            'foo-b?r',
            'foo',
            'foo-bar',
            'foo/**',
            'fiz/*',
            'foo/*',
            '**/biz',
            '*/bar',
            'foo/bar',
            'foo/**/biz',
            'foo/*/biz',
            'buz/foo/biz',
            'fiz/*/biz/*',
            'biz/*/*/lorum',
            '*/bar/*/biz',
            '*/biz/*/buz',
            'biz/*-bar/*/lorum',
            'biz/foo-bar/*/lorum',
            'biz/foo/*/lorum',
            'foo/bar/*/biz',
            'foo/biz/*/biz',
            'foo/biz/*/buz',
            '*/biz/*/biz/**',
            'biz/**/biz/**/x',
            '*/biz/*/*/biz',
            '*/biz/foo/*/biz',
            '*/biz/bar/**/*/*/biz',
            '*/biz/bar/**/foo/*/biz',
            '*/biz/x/y/z/a/b/c/*/biz/**',
            'a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/0/1/2/3/4/5/6/7/8/9',
        ]);
    });
});
