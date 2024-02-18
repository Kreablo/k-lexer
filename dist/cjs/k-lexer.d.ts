import { Lexer, Token } from 'typescript-parsec';
type Context = string | number;
export declare class KLexerContext<T> {
    readonly errormessage: string;
    readonly regexp: RegExp;
    private readonly tokenGenerators;
    constructor(tokenGenerators: [string, ((character: string) => [T, Context, boolean])][], errormessage: string, regexpFlags: string | undefined);
    match(input: string, index: number, rowBegin: number, columnBegin: number): [T, Context, string, boolean];
}
export declare class KLexer<T> implements Lexer<T> {
    private readonly contexts;
    private currentContext;
    private current;
    private initial;
    constructor(contexts: [Context, KLexerContext<T>][]);
    reset(): void;
    parse(input: string): Token<T> | undefined;
    parseNextAvailable(input: string, index: number, rowBegin: number, columnBegin: number): Token<T> | undefined;
}
export {};
