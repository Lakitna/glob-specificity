/**
 * Specificness of a glob pattern.
 *
 * Sorted from most important to least important.
 * For each value: Higher is more specific.
 */
export type GlobSpecificity = [
    /**
     * A Base4 segment mask where each number is a segment:
     * - 1 = double star segment
     * - 2 = single star segment
     * - 3 = other segment
     *
     * The mask is provided as a Base10 number.
     */
    segmentMask: number,

    /**
     * Number of `*` wildcards in Other segments.
     */
    starWildcard: number,

    /**
     * Number of `?` wildcards in Other segments.
     */
    questionWildcard: number,

    /**
     * `[chars]` matchers in Other segments.
     */
    charMatchWildcard: number,

    /**
     * `{a,b,...}` sub patterns in Other segments.
     */
    subPatternWildcard: number
];

/**
 * Returns specificness for the given Glob pattern.
 *
 * Specificness takes into account (in order of importance):
 * - Amount of segments as separated by `/`
 * - Segment type:
 *   - Double-star (`**`) wildcard segment
 *   - Single-star (`*`) wildcard segment
 *   - Other segment. Can contain
 *     - `*` wildcard
 *     - `?` wildcard
 *     - `[char]` matches a single character in `chars`
 *     - `{a,b,...}` matches any of the subpatterns `a`, `b`, etc.
 *
 * @example
 * globSpecificity('foo/bar')
 * // [15, 0, 0, 0, 0]
 *
 * @example
 * globSpecificity('foo/b*r/b??')
 * // [63, -1, -2, 0, 0]
 */
export function globSpecificity(globPattern: string): GlobSpecificity {
    const segmentSeparator = new RegExp('/', 'g');

    let starCount: number = 0;
    let questionCount: number = 0;
    let charMatchCount: number = 0;
    let subPatternCount: number = 0;

    const segmentMask = globPattern
        .split(segmentSeparator)
        .map((segment) => {
            if (segment === '**') return 1; // double-star segment
            if (segment === '*') return 2; // single-star segment

            starCount -= segment.split('*').length - 1;
            questionCount -= segment.split('?').length - 1;

            const charMatches = segment.match(/\[.+?\]/g);
            if (charMatches) {
                // -2 to subtract the brackets `[` and `]`
                // -1 because `[a]` is as specific as `a`
                charMatchCount -= charMatches.reduce((prev, cur) => prev + cur.length - 3, 0);
            }

            const subPatternMatches = segment.match(/\{.+?\}/g);
            if (subPatternMatches) {
                // -1 because `{a}` is as specific as `a`
                subPatternCount -= subPatternMatches.reduce(
                    (prev, cur) => prev + cur.split(',').length - 1,
                    0
                );
            }

            return 3; // other segment
        })
        .reverse()
        .join('');

    return [parseInt(segmentMask, 4), starCount, questionCount, charMatchCount, subPatternCount];
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
 */
export function sortByGlobSpecificity<T extends { glob: string; specificity: GlobSpecificity }>(
    values: T[]
): T[] {
    return values.sort((a, b) => {
        for (const i of a.specificity.keys()) {
            if (a.specificity[i] > b.specificity[i]) return 1;
            if (a.specificity[i] < b.specificity[i]) return -1;
        }

        // Same specificity. Sort alphabetically to ensure consistency
        if (a.glob > b.glob) return 1;
        if (a.glob < b.glob) return -1;

        return 0;
    });
}
