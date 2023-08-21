import fill from 'fill-range';

/**
 * Specificness of a glob pattern.
 *
 * Sorted from most important to least important.
 * For each value: Higher is more specific.
 */
export class GlobSpecificity {
    /**
     * A Base3 segment mask where segments are represented as:
     * - globstar segment = ''
     * - single star segment = '1'
     * - other segment = '2'
     *
     * The mask is provided as a Base10 number.
     */
    segmentMask: number;

    /**
     * Number of `*` wildcards that are part of Other segments.
     */
    starWildcard: number;

    /**
     * Number of `?` wildcards in Other segments.
     */
    questionWildcard: number;

    /**
     * `[chars]` matchers in Other segments.
     */
    characterMatchWildcard: number;

    /**
     * `{a,b,...}` sub patterns in Other segments.
     */
    subPatternWildcard: number;

    constructor(
        segmentMask: number,
        starWildcard: number,
        questionWildcard: number,
        characterMatchWildcard: number,
        subPatternWildcard: number
    ) {
        this.segmentMask = segmentMask;
        this.starWildcard = starWildcard;
        this.questionWildcard = questionWildcard;
        this.characterMatchWildcard = characterMatchWildcard;
        this.subPatternWildcard = subPatternWildcard;
    }

    /**
     * Compare to another instance.
     *
     * Returns 1 if this is more specific
     * Returns 0 if equally specific
     * Returns -1 if this is less specific
     */
    compareTo(other: GlobSpecificity): -1 | 0 | 1 {
        // In order of importance (most to least)
        const metrics = [
            'segmentMask',
            'starWildcard',
            'questionWildcard',
            'characterMatchWildcard',
            'subPatternWildcard',
        ] as const;

        for (const metric of metrics) {
            if (this[metric] > other[metric]) return 1;
            if (this[metric] < other[metric]) return -1;
        }
        return 0;
    }
}

/**
 * Returns specificness for the given Glob pattern.
 *
 * Specificness takes into account (in order of importance):
 * - Amount of segments as separated by `/`
 * - Segment type:
 *   - Globstar (`**`) wildcard segment
 *   - Single-star (`*`) wildcard segment
 *   - Other segment. Can contain
 *     - `*` wildcard
 *     - `?` wildcard
 *     - `[char]` matches a single character in `chars`
 *     - `{a,b,...}` matches any of the subpatterns `a`, `b`, etc.
 *
 * @example
 * globSpecificity('foo/bar')
 *
 * @example
 * globSpecificity('foo/b*r/b??')
 */
export function globSpecificity(globPattern: string): GlobSpecificity {
    const segments = globPattern.split(/\//g);

    let segmentMask = '';
    let starCount = 0;
    let questionCount = 0;
    let charMatchCount = 0;
    let subPatternCount = 0;
    for (const segment of segments) {
        if (segment === '**') {
            // globstar segment
            continue;
        }
        if (segment === '*') {
            // single-star segment
            segmentMask = '1' + segmentMask;
            continue;
        }

        starCount -= countSegmentStar(segment);
        questionCount -= countSegmentQuestion(segment);
        charMatchCount -= countSegmentCharWildcard(segment);
        subPatternCount -= countSegmentSubPattern(segment);

        segmentMask = '2' + segmentMask; // other segment
    }

    return new GlobSpecificity(
        segmentMask.length === 0 ? 0 : Number.parseInt(segmentMask, 3),
        starCount,
        questionCount,
        charMatchCount,
        subPatternCount
    );
}

function countSegmentStar(segment: string): number {
    return (
        segment.split('*').filter((s) => {
            // Escaped, don't count
            return !s.endsWith('\\');
        }).length - 1
    );
}

function countSegmentQuestion(segment: string): number {
    return (
        segment.split('?').filter((s) => {
            // Escaped, don't count
            return !s.endsWith('\\');
        }).length - 1
    );
}

function countSegmentCharWildcard(segment: string): number {
    const groupMatcher = /\\?\[.+?]/g;
    const rangeMatcher = /\[(.)-(.)]/;

    const charMatches = segment.match(groupMatcher);
    if (!charMatches) {
        return 0;
    }

    let count = 0;
    for (const match of charMatches) {
        if (match.startsWith('\\')) {
            // Escaped, don't count
            continue;
        }
        const rangeMatch = rangeMatcher.exec(match);
        // eslint-disable-next-line unicorn/prefer-ternary
        if (rangeMatch) {
            // -1 because `[a-a]` is as specific as `a`
            count += fill(rangeMatch[1], rangeMatch[2]).length - 1;
        } else {
            // -2 to subtract the brackets `[` and `]`
            // -1 because `[a]` is as specific as `a`
            count += match.length - 3;
        }
    }
    return count;
}

function countSegmentSubPattern(segment: string): number {
    const groupMatcher = /\\?{.+?}/g;

    const subPatternMatches = segment.match(groupMatcher);
    if (!subPatternMatches) {
        return 0;
    }

    let count = 0;
    for (const match of subPatternMatches) {
        if (match.startsWith('\\')) {
            // Escaped, don't count
            continue;
        }

        // -1 because `{a}` is as specific as `a`
        count += match.split(',').length - 1;
    }
    return count;
}

/**
 * Sort an array of glob patterns by
 *
 * 1. Specificity
 * 2. Glob pattern, alphabetical. Ensures consistent sorting.
 *
 * Sorts from least specific to most specific.
 *
 * @example
 * globSpecificitySort(['foo/bar', 'foo/*', 'foo/**'])
 * // [ 'foo/**', 'foo/*', 'foo/bar' ]
 *
 * @example
 * globSpecificitySort(['lorum/ipsum', 'foo/[bB]ar', 'hello/w?rld', 'amazing/*'])
 * // [ 'amazing/*', 'hello/w?rld', 'foo/[bB]ar', 'lorum/ipsum' ]
 */
export function globSpecificitySort<G extends string>(globPatterns: G[]): G[] {
    const output = globPatterns.map((pattern) => {
        return {
            glob: pattern,
            specificity: globSpecificity(pattern),
        };
    });

    return sortByGlobSpecificity(output).map((v) => v.glob as G);
}

/**
 * Sort an array of glob specificity objects by
 *
 * 1. Specificity
 * 2. Glob pattern, alphabetical. Ensures consistent sorting.
 *
 * Sorts from least specific to most specific.
 */
export function sortByGlobSpecificity<T extends { glob: string; specificity: GlobSpecificity }>(
    values: T[]
): T[] {
    return values.sort((a, b) => {
        const comparison = a.specificity.compareTo(b.specificity);
        if (comparison !== 0) {
            return comparison;
        }

        // Same specificity. Sort alphabetically to ensure consistency and solve some edge cases
        if (a.glob > b.glob) return 1;
        if (a.glob < b.glob) return -1;

        return 0;
    });
}
