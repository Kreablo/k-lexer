import { TokenError } from 'typescript-parsec';
class TokenImpl {
    constructor(lexer, input, kind, text, pos, keep) {
        this.lexer = lexer;
        this.input = input;
        this.kind = kind;
        this.text = text;
        this.pos = pos;
        this.keep = keep;
    }
    get next() {
        if (this.nextToken === undefined) {
            this.nextToken = this.lexer.parseNextAvailable(this.input, this.pos.index + this.text.length, this.pos.rowEnd, this.pos.columnEnd);
            if (this.nextToken === undefined) {
                this.nextToken = null;
            }
        }
        return this.nextToken === null ? undefined : this.nextToken;
    }
}
export class KLexerContext {
    constructor(tokenGenerators, errormessage, regexpFlags) {
        this.errormessage = errormessage;
        for (const re of tokenGenerators) {
            if (re[0].search(/(?<!\\)\((?!\?)/) >= 0) {
                throw new Error("The regexp snippets must not contain grouping parenthesis! '" + re[0] + "'");
            }
        }
        if (regexpFlags !== undefined && regexpFlags.indexOf('g') >= 0) {
            throw new Error("The g flag must not be used!");
        }
        const regexStr = "(" + tokenGenerators.map((v) => v[0]).join(")|(") + ")|(.)";
        const fl = (regexpFlags !== undefined && regexpFlags.indexOf('y') >= 0 ? '' : 'y') +
            (regexpFlags !== undefined && regexpFlags.indexOf('s') >= 0 ? '' : 's') +
            (regexpFlags === undefined ? '' : regexpFlags);
        this.regexp = new RegExp(regexStr, fl);
        this.tokenGenerators = tokenGenerators.map((v) => v[1]);
    }
    match(input, index, rowBegin, columnBegin) {
        this.regexp.lastIndex = index;
        const result = this.regexp.exec(input);
        if (result === null) {
            // This should not happen, since '.' is an alternative and there should be characters to match.
            throw new Error("The regexp did not match! index: " + index + " current regexp: " + this.regexp + " input: '" + input + "'");
        }
        const match = result.findIndex((element, index, _) => index > 0 && element !== undefined);
        // console.log("matched '" + input + "' at " + index + " against " + this.regexp + " result is " + result);
        if (match < 0 || match > this.tokenGenerators.length + 1) {
            // Once again, this should not happen.
            throw new Error("No group matched! index: " + index + " current regexp: " + this.regexp + " input: '" + input + "'" + " match: '" + match + "'");
        }
        if (match === this.tokenGenerators.length + 1) {
            // This matched the '.' at the end.
            throw new TokenError({ index, rowBegin, columnBegin, rowEnd: rowBegin, columnEnd: columnBegin }, this.errormessage);
        }
        const g = this.tokenGenerators[match - 1];
        const text = result[0];
        const [t, ctx, keep] = g(result[0]);
        return [t, ctx, text, keep];
    }
}
export class KLexer {
    constructor(contexts) {
        this.contexts = new Map();
        if (contexts.length < 1) {
            throw new Error("At least one lexer context must be provided.");
        }
        this.initial = contexts[0][0];
        this.current = this.initial;
        for (const ctx of contexts) {
            this.contexts.set(ctx[0], ctx[1]);
        }
        const nc = this.contexts.get(this.current);
        if (nc === undefined) {
            throw new Error("There is no context for '" + this.current + "'");
        }
        this.currentContext = nc;
    }
    reset() {
        this.current = this.initial;
    }
    parse(input) {
        this.reset();
        return this.parseNextAvailable(input, 0, 1, 1);
    }
    parseNextAvailable(input, index, rowBegin, columnBegin) {
        // console.log("parseNextAvailable: input: '" + input + "' + index: " + index + " currentContext: " + this.current + " current regexp: " + this.currentContext.regexp);
        if (index >= input.length) {
            return undefined;
        }
        const context = this.currentContext;
        const [t, nextContext, text, keep] = context.match(input, index, rowBegin, columnBegin);
        if (nextContext !== this.current) {
            const nc = this.contexts.get(nextContext);
            if (nc === undefined) {
                throw new Error("Context " + nextContext + " does not exist.");
            }
            this.currentContext = nc;
            this.current = nextContext;
            if (this.currentContext === undefined) {
                throw new Error("There is no context for '" + nextContext + "'");
            }
        }
        if (t === undefined) {
            throw new Error(context.errormessage);
        }
        let rowOffset = 0;
        let columnOffset = 0;
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);
            if (c === '\n') {
                rowOffset++;
                columnOffset = 1 - columnBegin;
            }
            else {
                columnOffset++;
            }
        }
        const rowEnd = rowBegin + rowOffset;
        const columnEnd = columnBegin + columnOffset;
        if (keep) {
            //            console.log("Accepted '" + text + "' as type " + t);
            return new TokenImpl(this, input, t, text, { index, rowBegin, rowEnd, columnBegin, columnEnd }, keep);
        }
        else {
            return this.parseNextAvailable(input, index + text.length, rowEnd, columnEnd);
        }
    }
}
