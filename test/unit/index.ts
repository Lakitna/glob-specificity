import { expect } from 'chai';

import { globSpecificity, globSpecificitySort } from '../../src';

describe('sortGlob', function () {
    it('sorts many things properly', function () {
        const input = [
            'foo/**',
            'foo-bar',
            '*-bar',
            'foo/*/{biz,somethingQuiteLong}',
            '**-bar',
            '*/bar',
            'foo/*',
            '**/**',
            '**/*',
            'foo',
            'biz/foo-bar/*/[lL]orum',
            '[a-b]oo[Pp]',
            'a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/0/1/2/3/4/5/6/7/8/9',
            'foo/*/{biz,buz,baz,bez}',
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
            '[a-z]oo[Pp]',
            'biz/foo-bar/*/lorum',
            'fiz/*/biz/*',
            'foo/biz/*/biz',
            '*/bar/*/biz',
            'foo-b?r',
            '*/biz/bar/**/*/*/biz',
            'foo/bar',
            'biz/*/*/ab*ef',
            'biz/*/*/lorum',
            'biz/*/*/abc**ef',
            '[aB]oo[Pp]',
            '**',
            'foo/bar',
            '*/biz/*/buz',
            'buz/foo/biz',
            '**/biz',
            '[ab]oo[Pp]',
            '*/biz/*/*/biz',
            'biz/*-bar/*/lorum',
            'foo/*/{biz,buz,baz}',
            'biz/foo/*/lorum',
            'foo/aar',
            '*/biz/*/biz/**',
            '*/biz/x/y/z/a/b/c/*/biz/**',
            '[fFL]oo[Pp]',
            '*',
            '?',
            'biz/**/biz/**/x',
        ];

        expect(globSpecificitySort(input)).to.deep.equal([
            '**',
            '**/**',
            '*',
            '**/*',
            '**-bar',
            'z-*-foo-*',
            '*-bar',
            'foo-*',
            '?',
            'foo-b?r',
            '[a-z]oo[Pp]',
            '[fFL]oo[Pp]',
            '[a-b]oo[Pp]',
            '[aB]oo[Pp]',
            '[ab]oo[Pp]',
            '**/biz',
            'foo',
            'foo-bar',
            'foo/**',
            'fiz/*',
            'foo/*',
            '*/bar',
            'foo/**/biz',
            'foo/aar',
            'foo/bar',
            'foo/bar',
            'foo/*/{biz,buz,baz,bez}',
            'foo/*/{biz,buz,baz}',
            'foo/*/{biz,buz}',
            'foo/*/{biz,somethingQuiteLong}',
            'foo/*/biz',
            'biz/**/biz/**/x',
            'buz/foo/biz',
            'fiz/*/biz/*',
            'biz/*/*/abc**ef',
            'biz/*/*/ab*ef',
            'biz/*/*/lorum',
            '*/bar/*/biz',
            '*/biz/*/biz/**',
            '*/biz/*/buz',
            'biz/*-bar/*/lorum',
            'biz/foo-bar/*/[lL]orum',
            'biz/foo-bar/*/lorum',
            'biz/foo/*/lorum',
            'foo/bar/*/biz',
            'foo/biz/*/biz',
            'foo/biz/*/buz',
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
    it('returns a Globspecificity object', function () {
        const result = globSpecificity('foo/b*r/b??');

        expect(result).to.deep.equal([26, -1, -2, 0, 0]);
    });

    it('returns 0 for all but the segmentmask with a simple pattern', function () {
        const result = globSpecificity('foo');

        expect(result).to.deep.equal([2, 0, 0, 0, 0]);
    });

    describe('Star wildcard', function () {
        it('returns -1 with a single star', function () {
            const result = globSpecificity('foo*');

            expect(result).to.deep.equal([2, -1, 0, 0, 0]);
        });

        it('returns -2 with two stars', function () {
            const result = globSpecificity('f*oo*');

            expect(result).to.deep.equal([2, -2, 0, 0, 0]);
        });

        it('returns 0 with an escaped single star', function () {
            const result = globSpecificity('foo\\*');

            expect(result).to.deep.equal([2, 0, 0, 0, 0]);
        });
    });

    describe('Question wildcard', function () {
        it('returns -1 with a single questionmark', function () {
            const result = globSpecificity('foo?');

            expect(result).to.deep.equal([2, 0, -1, 0, 0]);
        });

        it('returns -2 with two questionmarks', function () {
            const result = globSpecificity('f?oo?');

            expect(result).to.deep.equal([2, 0, -2, 0, 0]);
        });

        it('returns 0 with an escaped single questionmark', function () {
            const result = globSpecificity('foo\\?');

            expect(result).to.deep.equal([2, 0, 0, 0, 0]);
        });
    });

    describe('character match', function () {
        it('returns -1 with a single wildcard', function () {
            const result = globSpecificity('[Ff]oo');

            expect(result).to.deep.equal([2, 0, 0, -1, 0]);
        });

        it('returns -2 with a single three-char wildcard', function () {
            const result = globSpecificity('[Ffv]oo');

            expect(result).to.deep.equal([2, 0, 0, -2, 0]);
        });

        it('returns -2 with two wildcards', function () {
            const result = globSpecificity('[Ff]o[Oo]');

            expect(result).to.deep.equal([2, 0, 0, -2, 0]);
        });

        it('returns 0 with an escaped opening bracket', function () {
            const result = globSpecificity('\\[Ff]oo');

            expect(result).to.deep.equal([2, 0, 0, 0, 0]);
        });
    });

    describe('subpattern', function () {
        it('returns -1 with a single wildcard', function () {
            const result = globSpecificity('{Foo,foo}');

            expect(result).to.deep.equal([2, 0, 0, 0, -1]);
        });

        it('returns -2 with a single three-pattern wildcard', function () {
            const result = globSpecificity('{Foo,foo}{Foo,foo}');

            expect(result).to.deep.equal([2, 0, 0, 0, -2]);
        });

        it('returns -2 with two wildcards', function () {
            const result = globSpecificity('{Foo,foo,bar}');

            expect(result).to.deep.equal([2, 0, 0, 0, -2]);
        });

        it('returns 0 with an escaped opening brace', function () {
            const result = globSpecificity('\\{Foo,foo}');

            expect(result).to.deep.equal([2, 0, 0, 0, 0]);
        });
    });
});
