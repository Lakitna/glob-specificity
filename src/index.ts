/* global Omit */

type Override<T1, T2> = Omit<T1, keyof T2> & T2;
type Sortable<T> = Override<T, { specificity: GlobSpecificity }>;
interface GlobSpecificity {
    /**
     * A Base3 segment mask where each number is a segment:
     * - 0 = double star segment
     * - 1 = single star segment
     * - 2 = other segment
     *
     * The mask is provided as a Base10 number.
     *
     * This is a positive integer where 0 = least specific.
     */
    segmentMask: number;

    /**
     * Number of wildcards in Other segments
     */
    wildcards: {
        /**
         * Number of `*` wildcards in Other segments.
         *
         * This is a positive integer where 0 = most specific.
         */
        star: number;

        /**
         * Number of `?` wildcards in Other segments.
         *
         * This is a positive integer where 0 = most specific.
         */
        question: number;
    }
}

/**
 * Returns a single specificness number for the given Glob pattern.
 *
 * Specificness takes into account (in order of importance):
 * - Amount of segments
 * - Segment type:
 *   - Double-star (`**`) wildcard segments
 *   - Single-star (`*`) wildcard segments
 *   - Other segments
 *     - `*` wildcards which are part of Other segments
 *     - `?` wildcards which are part of Other segments
 */
export function globSpecificness(globPattern: string): GlobSpecificity {
    const segmentSeparator = /[/\\]/g;

    const wildcardCount = {
        star: 0,
        question: 0,
    };
    const segmentMask = globPattern
        .split(segmentSeparator)
        .map((segment) => {
            if (segment === '**') return 0; // double-star segment
            if (segment === '*') return 1; // single-star segment

            // other segment
            wildcardCount.star += segment.split('*').length - 1;
            wildcardCount.question += segment.split('?').length - 1;
            return 2;
        })
        .reverse()
        .join('');

    return {
        segmentMask: parseInt(`1${segmentMask}`, 3) - 3,
        wildcards: wildcardCount,
    };
}

/**
 * Sort an array of glob patterns on
 * 1. Alphabet (standard string sort)
 * 2. Pattern specificness
 */
export default function sortGlob(patterns: string[]): string[] {
    const output = patterns
        .sort() // alphabetical sort
        .map((pattern) => {
            return {
                pattern: pattern,
                specificity: globSpecificness(pattern),
            };
        });

    return sortBySpecificity(output)
        .map((v) => v.pattern as string);
}

/**
 * Sort on provided specificity.
 *
 * Note that this function does not calculate the specificity for you.
 */
export function sortBySpecificity<T extends Sortable<T>>(patterns: T[]): T[] {
    return patterns.sort((a, b) => {
        // Segment mask
        if (a.specificity.segmentMask > b.specificity.segmentMask) return 1;
        if (a.specificity.segmentMask < b.specificity.segmentMask) return -1;

        // Other segment `*` wildcard
        if (a.specificity.wildcards.star > b.specificity.wildcards.star) return -1;
        if (a.specificity.wildcards.star < b.specificity.wildcards.star) return 1;

        // Other segment `?` wildcard
        if (a.specificity.wildcards.question > b.specificity.wildcards.question) return -1;
        if (a.specificity.wildcards.question < b.specificity.wildcards.question) return 1;

        return 0;
    });
}
