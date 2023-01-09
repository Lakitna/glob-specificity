# glob-specificity

Define how specific a glob pattern is.

The specificness of a glob pattern can be very hard to define. This approach aims for 95% accuracy
and only supports the following glob features:

| pattern     | description                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| `**`        | Matches any sequence of zero or more segments                                   |
| `*`         | Matches any sequence of zero or more characters                                 |
| `foo-*-bar` | Matches any sequence of zero or more characters surrounded by `foo-` and `-bar` |
| `?`         | Matches any single character                                                    |
| `[chars]`   | Matches any single character in 'chars'                                         |
| `[a-f]`     | Matches any single character in 'abcdef'                                        |
| `{a,b,...}` | Matches any of the sub-patterns 'a', 'b', '...'.                                |

POSIX character classes and Extended glob patterns are _not supported_.

## Installation

```shell
npm install glob-specificity
```

## Getting started

Sort an array of glob patterns by their specificty.

```typescript
import { globSpecificitySort } from 'glob-specificity';

globSpecificitySort(['foo/bar', 'foo/*', 'foo/**']);
// [ 'foo/**', 'foo/*', 'foo/bar' ]
```

Calculate specificy first, sort at a later time.

```typescript
import { globSpecificity, sortByGlobSpecificity } from './dist/glob-specificity.mjs';

const patterns = ['foo/bar', '*/bar', 'foo/*'];
const patternsWithSpecificity = patterns.map((pattern) => {
  return {
    glob: pattern,
    specificity: globSpecificity(pattern),
  };
});

// Do other things

sortByGlobSpecificity(patternsWithSpecificity);
// [
//     { glob: 'foo/*', specificity: [ 5, 0, 0, 0, 0 ] },
//     { glob: '*/bar', specificity: [ 7, 0, 0, 0, 0 ] },
//     { glob: 'foo/bar', specificity: [ 8, 0, 0, 0, 0 ] }
// ]
```

## Definition of specificity

It is hard to pin down what specificity is for glob patterns. Not everyone will agree with all parts
of this definition. If you disagree with any part of this definition, please let me know via an
issue.

We detemine how specific a glob pattern is by 5 metrics. In order of importance:

1. Segment mask
   - Segment count
   - Segment types
2. Number of star wildcards `*`
3. Number of questionmark wildcards `?`
4. Number of characters in character matcher `[chars]`
5. Number of subpatterns `{a,b,...}`

### 1. Segment mask

First we seperate the pattern into segments. A pattern with more segments is more specific. Each
segment is assigned one of the following types:

- Globstar segment `**`
- Star-segment `*`
- Other segment

Globstar segments are least specific and other segments are most specific.

```typescript
'foo/*/bar/**'
-> ['foo', '*', 'bar', '**'] // Separate segments
-> [other, star, other, globStar] // Assign segments a type
-> [2, 1, 2, undefined] // Assign types a numeric value
-> '212' // Join values into segment mask
-> 23 // Convert base3 -> base10
```

### 2. Number of star wildcards `*`

Number of star `*` characters in a pattern. Star `*` characters in star segments and globstar
segments are ignored (see segment types).

```typescript
'foo/*/b*r/**/*or*m'
-> ['foo', 'b*r', '*or*m'] // Remove star and globstar segments
-> [0, 1, 2] // Count star characters
-> 3 // Sum
```

Escaped stars `\*` are ignored.

### 3. Number of questionmark wildcards `?`

Number of questionmark `?` characters in a pattern.

```typescript
'foo/b?r/l?r?m'
-> 3 // Count questionmark characters
```

Escaped questionmarks `\?` are ignored.

### 4. Number of characters in character matcher `[chars]`

Number of characters in a character matcher.

```typescript
'[f]oo/[Bb]ar/loru[mnf]'
-> ['[f]', '[Bb]', '[mnf]'] // Find matchers
-> [0, 1, 2] // Count characters - 1
-> 3 // Sum
```

-1 because `[f]oo` is as specific as `foo`.

A range is expanded before counting, so `[a-f]` counts as 6 characters.

```typescript
'foo/ba[a-f]'
-> ['[a-f]'] // Find matchers
-> ['[abcdef]'] // Expand range
-> [5] // Count characters - 1
-> 5 // Sum
```

Escaped ranges `\[chars]` are ignored.

### 5. Number of subpatterns `{a,b,...}`

Number of subpatterns in a pattern.

```typescript
'{baz}/foo/{bar,lorum}/{alpha,beta,gamma}'
-> ['{baz}', '{bar,lorum}', '{alpha,beta,gamma}'] // Find subpatterns
-> [0, 1, 2] // Count patterns - 1
-> 3 // Sum
```

-1 because `{baz}` is as specific as `baz`.

Escaped subpatterns `\{a,b,...}` are ignored.
