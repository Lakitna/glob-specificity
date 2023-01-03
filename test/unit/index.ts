import { expect } from 'chai';

import { globSpecificity, globSpecificitySort } from '../../src';

describe('sortGlob', function () {
    it('sorts many things properly', function () {
        const input = [
            'foo/**',
            'foo-bar',
            '*-bar',
            '**-bar',
            '*/bar',
            'foo/*',
            'foo',
            'biz/foo-bar/*/[lL]orum',
            'a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/0/1/2/3/4/5/6/7/8/9',
            'foo/bar/*/biz',
            'z-*-foo-*',
            'foo/**/biz',
            '*/biz/bar/**/foo/*/biz',
            'fiz/*',
            'foo/biz/*/buz',
            'foo-*',
            'foo/*/biz',
            'foo/*/{biz,buz}',
            '*/biz/foo/*/biz',
            'biz/foo-bar/*/lorum',
            'fiz/*/biz/*',
            'foo/biz/*/biz',
            '*/bar/*/biz',
            'foo-b?r',
            '*/biz/bar/**/*/*/biz',
            'biz/*/*/ab*ef',
            'biz/*/*/lorum',
            'biz/*/*/abc**ef',
            '[aB]oo[Pp]',
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
            '[fFL]oo[Pp]',
            '*',
            '?',
            'biz/**/biz/**/x',
        ];

        expect(globSpecificitySort(input)).to.deep.equal([
            '**',
            '*',
            '**-bar',
            'z-*-foo-*',
            '*-bar',
            'foo-*',
            '?',
            'foo-b?r',
            '[fFL]oo[Pp]',
            '[aB]oo[Pp]',
            'foo',
            'foo-bar',
            'foo/**',
            'fiz/*',
            'foo/*',
            '**/biz',
            '*/bar',
            'foo/bar',
            'foo/**/biz',
            'foo/*/{biz,buz}',
            'foo/*/biz',
            'buz/foo/biz',
            'fiz/*/biz/*',
            'biz/*/*/abc**ef',
            'biz/*/*/ab*ef',
            'biz/*/*/lorum',
            '*/bar/*/biz',
            '*/biz/*/buz',
            'biz/*-bar/*/lorum',
            'biz/foo-bar/*/[lL]orum',
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

describe('globSpecificness', function () {
    it('returns a Globspecificity obejct', function () {
        const result = globSpecificity('foo/b*r/b??');

        expect(result).to.deep.equal([63, -1, -2, 0, 0]);
    });
});
