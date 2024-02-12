# K-Lexer

This lexer tokenize a character stream by applying a regular
expression composed of fragments on the form

<pre>
/(fragment<sub>1</sub>)|(fragment<sub>2</sub>)|...|(fragment<sub>n</sub>)/ys.
</pre>

A matching fragment is associated with a token and a context transfer.
Thus it is possible to have multiple contexts with different sets of
tokens enabled.

# API Reference

The class `KLexer` implements the `Lexer` interface from
typescript-parsec.  The parameter to the constructor is an array of
lexer context (`KLexerContext`).  The type parameter `T` is the type
of the token kind, typically an enum.

```typescript

const lexer = new KLexer<T>(contexts: KLexerContext<T>[]);
```

The first lexer context in the array is used as the initial context.

the `parse(input: string)` method initates the lexer and returns the
first token in the stream.  The following token, if any, is obtained
by accessing the `next` property of the token.

The class `KLexerContext` represent a lexer context.

```typescript
const context1 = new KLexerContext<T>(
   tokenGenerators: [string, ((character: string) => [T, Context, boolean])][],
   public readonly errormessage: string,
   regexpFlags: string | undefined
);
```

The parameter tokenGenerators is an array of tuples, each tuple
consisting of a regular expression fragment and a function that
produce a 3-tuple.  The 3-tuple consists of the token kind, the next
context, and a boolean flag to indicate if the token should be
included in the token stream.  The regexp fragments must not contain
grouping parenthesis.  Non-grouping parenthesis may be used.

The error message is used as a parameter to the exception that is
thrown if none of the regular expression fragments matches the current
position in the input.

The regexp flags are added to the regular expression in addition to
'ys'. The flags must not conflict with the operation of the
lexer. 'i', 'm', 'u' and 'v' is ok to use but not 'g' and 'd'.


## Example: double quoted string with variable interpolation:

```typescript
import { KLexerContext, KLexer } from 'k-lexer';

enum TokenType {
    SCALAR,
    ASSIGNMENT,
    DOUBLE_QUOTE,
    STRING_CONTENT,
    WHITESPACE
};

enum Context {
    TOP,
    DOUBLE_QUOTED_STRING
};

type ctx = [Context, KLexerContext<TokenType>];

const _frag: (regexp: string, tokentype: TokenType, keep: boolean) => (nextContext: Context) => [string, (character: string) => [TokenType, Context, boolean]] =
    (regexp, tokentype, keep) => (nextContext) => [regexp, (_) => [tokentype, nextContext, keep]];

const scalar         = _frag('\\$[a-zA-Z_0-9]+', TokenType.SCALAR, true);
const assignment     = _frag('=', TokenType.ASSIGNMENT, true);
const double_quote   = _frag('"', TokenType.DOUBLE_QUOTE, true);
const string_content = _frag('(?:[^"$\\\\]|\\\\[\\\\$"])+', TokenType.STRING_CONTENT, true);
const whitespace     = _frag('[\\t\\s\\n\\r]+', TokenType.WHITESPACE, false);

const top_context: ctx = [Context.TOP, new KLexerContext(
    [
        scalar(Context.TOP),
        assignment(Context.TOP),
        double_quote(Context.DOUBLE_QUOTED_STRING),
        whitespace(Context.TOP)
    ], 'failed-lexing-position-context', '')
];

const double_quoted_string: ctx = [Context.DOUBLE_QUOTED_STRING, new KLexerContext(
    [
        string_content(Context.DOUBLE_QUOTED_STRING),
        scalar(Context.DOUBLE_QUOTED_STRING),
        double_quote(Context.TOP),
    ], 'failed-double-quoted', '')
];

const lexer = new KLexer([top_context, double_quoted_string]);

let t = lexer.parse('  $hello = "hello, \\"$name\\"" ');

while (t !== undefined) {
    switch (t.kind) {
        case TokenType.SCALAR:
            console.log("SCALAR: " + t.text);
            break;
        case TokenType.ASSIGNMENT:
            console.log("ASSIGNMENT");
            break;
        case TokenType.DOUBLE_QUOTE:
            console.log("DOUBLE_QUOTE");
            break;
        case TokenType.STRING_CONTENT:
            console.log("STRING_CONTENT: '" + t.text + "'");
            break;
        default:
            throw new Error("Invalid token: " + t.kind);
    }
     t = t.next;
}
```

The output will be:

```
SCALAR: $hello
ASSIGNMENT
DOUBLE_QUOTE
STRING_CONTENT: 'hello, \"'
SCALAR: $name
STRING_CONTENT: '\"'
DOUBLE_QUOTE

```
