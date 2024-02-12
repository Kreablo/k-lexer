import * as assert from 'assert';
import { KLexer, KLexerContext } from '../lib/k-lexer';

test('KLexer: lexing', () => {
    const lexer = new KLexer([
        ['ctx', new KLexerContext([
            ['a', (_) => ['A', 'ctx', true]],
            ['b+', (_) => ['B', 'ctx', true]],
            ['[0-9]+', (_) => ['DIGIT', 'ctx', true]]
        ], 'ERROR', '')]
    ]);
    const t1 = lexer.parse('abb123');
    assert.strictEqual(t1.pos.index, 0);
    assert.strictEqual(t1.pos.rowBegin, 1);
    assert.strictEqual(t1.pos.rowEnd, 1);
    assert.strictEqual(t1.pos.columnBegin, 1);
    assert.strictEqual(t1.pos.columnEnd, 2);
    assert.strictEqual(t1.text, 'a');
    assert.strictEqual(t1.kind, 'A');
    const t2 = t1.next;
    assert.strictEqual(t2.pos.index, 1);
    assert.strictEqual(t2.pos.rowBegin, 1);
    assert.strictEqual(t2.pos.rowEnd, 1);
    assert.strictEqual(t2.pos.columnBegin, 2);
    assert.strictEqual(t2.pos.columnEnd, 4);
    assert.strictEqual(t2.text, 'bb');
    assert.strictEqual(t2.kind, 'B');
    const t3 = t2.next;
    assert.strictEqual(t3.pos.index, 3);
    assert.strictEqual(t3.pos.rowBegin, 1);
    assert.strictEqual(t3.pos.rowEnd, 1);
    assert.strictEqual(t3.pos.columnBegin, 4);
    assert.strictEqual(t3.pos.columnEnd, 7);
    assert.strictEqual(t3.text, '123');
    assert.strictEqual(t3.kind, 'DIGIT');


});


test('KLexer: lexing_newlines', () => {
    const lexer = new KLexer([
        ['ctx', new KLexerContext([
            ['a+', (_) => ['A', 'ctx', true]],
            ['\n', (_) => ['NL', 'ctx', true]],
            [' +', (_) => ['SPACE', 'ctx', false]]
        ], 'ERROR', 'm')]
    ]);
    const t1 = lexer.parse('\na\naa  a\naaaaaaaaaaaa\n\n ');
    assert.strictEqual(t1.pos.index, 0);
    assert.strictEqual(t1.pos.rowBegin, 1);
    assert.strictEqual(t1.pos.rowEnd, 2);
    assert.strictEqual(t1.pos.columnBegin, 1);
    assert.strictEqual(t1.pos.columnEnd, 1);
    assert.strictEqual(t1.text, '\n');
    assert.strictEqual(t1.kind, 'NL');
    const t2 = t1.next;
    assert.strictEqual(t2.pos.index, 1);
    assert.strictEqual(t2.pos.rowBegin, 2);
    assert.strictEqual(t2.pos.rowEnd, 2);
    assert.strictEqual(t2.pos.columnBegin, 1);
    assert.strictEqual(t2.pos.columnEnd, 2);
    assert.strictEqual(t2.text, 'a');
    assert.strictEqual(t2.kind, 'A');
    const t3 = t2.next
    assert.strictEqual(t3.pos.index, 2);
    assert.strictEqual(t3.pos.rowBegin, 2);
    assert.strictEqual(t3.pos.rowEnd, 3);
    assert.strictEqual(t3.pos.columnBegin, 2);
    assert.strictEqual(t3.text, '\n');
    assert.strictEqual(t3.pos.columnEnd, 1);
    assert.strictEqual(t3.kind, 'NL');
    const t4 = t3.next;
    assert.strictEqual(t4.pos.index, 3);
    assert.strictEqual(t4.pos.rowBegin, 3);
    assert.strictEqual(t4.pos.rowEnd, 3);
    assert.strictEqual(t4.pos.columnBegin, 1);
    assert.strictEqual(t4.pos.columnEnd, 3);
    assert.strictEqual(t4.text, 'aa');
    assert.strictEqual(t4.kind, 'A');
    const t5 = t4.next;
    assert.strictEqual(t5.pos.index, 7);
    assert.strictEqual(t5.pos.rowBegin, 3);
    assert.strictEqual(t5.pos.rowEnd, 3);
    assert.strictEqual(t5.pos.columnBegin, 5);
    assert.strictEqual(t5.pos.columnEnd, 6);
    assert.strictEqual(t5.text, 'a');
    assert.strictEqual(t5.kind, 'A');
    const t6 = t5.next
    assert.strictEqual(t6.pos.index, 8);
    assert.strictEqual(t6.pos.rowBegin, 3);
    assert.strictEqual(t6.pos.rowEnd, 4);
    assert.strictEqual(t6.pos.columnBegin, 6);
    assert.strictEqual(t6.pos.columnEnd, 1);
    assert.strictEqual(t6.text, '\n');
    assert.strictEqual(t6.kind, 'NL');
    const t7 = t6.next;
    assert.strictEqual(t7.pos.index, 9);
    assert.strictEqual(t7.pos.rowBegin, 4);
    assert.strictEqual(t7.pos.rowEnd, 4);
    assert.strictEqual(t7.pos.columnBegin, 1);
    assert.strictEqual(t7.pos.columnEnd, 13);
    assert.strictEqual(t7.text, 'aaaaaaaaaaaa');
    assert.strictEqual(t7.kind, 'A');
    const t8 = t7.next
    assert.strictEqual(t8.pos.index, 21);
    assert.strictEqual(t8.pos.rowBegin, 4);
    assert.strictEqual(t8.pos.rowEnd, 5);
    assert.strictEqual(t8.pos.columnBegin, 13);
    assert.strictEqual(t8.pos.columnEnd, 1);
    assert.strictEqual(t8.text, '\n');
    assert.strictEqual(t8.kind, 'NL');
    const t9 = t8.next
    assert.strictEqual(t9.pos.index, 22);
    assert.strictEqual(t9.pos.rowBegin, 5);
    assert.strictEqual(t9.pos.rowEnd, 6);
    assert.strictEqual(t9.pos.columnBegin, 1);
    assert.strictEqual(t9.pos.columnEnd, 1);
    assert.strictEqual(t9.text, '\n');
    assert.strictEqual(t9.kind, 'NL');
    const t10 = t9.next
    assert.strictEqual(t10, undefined);
});

test('KLexer: lexing contexts', () => {

    const initial = new KLexerContext([
        ['foo', (_) => { return ['FOO', 'INITIAL', true] }],
        ['"', (_) => { return ['QUOTE', 'STRING', true] }]
    ], 'error in initial', '');

    const stringctx = new KLexerContext([
        ['(?:[^"\\\\]|(?:\\\\"))+', (_) => { return ['STRING_CONTENT', 'STRING', true] }],
        ['"', (_) => { return ['QUOTE', 'INITIAL', true] }]
    ], 'error in string', '');


    const contexts: [string, KLexerContext<string>][] = [
        ['INITIAL', initial],
        ['STRING', stringctx]
    ];

    const lexer = new KLexer(contexts);
    const t1 = lexer.parse("foo\"foo\\\"\"");
    assert.strictEqual(t1.pos.index, 0);
    assert.strictEqual(t1.pos.rowBegin, 1);
    assert.strictEqual(t1.pos.rowEnd, 1);
    assert.strictEqual(t1.pos.columnBegin, 1);
    assert.strictEqual(t1.pos.columnEnd, 4);
    assert.strictEqual(t1.text, 'foo');
    assert.strictEqual(t1.kind, 'FOO');
    const t2 = t1.next;
    assert.strictEqual(t2.pos.index, 3);
    assert.strictEqual(t2.pos.rowBegin, 1);
    assert.strictEqual(t2.pos.rowEnd, 1);
    assert.strictEqual(t2.pos.columnBegin, 4);
    assert.strictEqual(t2.pos.columnEnd, 5);
    assert.strictEqual(t2.text, '"');
    assert.strictEqual(t2.kind, 'QUOTE');
    const t3 = t2.next;
    assert.strictEqual(t3.pos.index, 4);
    assert.strictEqual(t3.pos.rowBegin, 1);
    assert.strictEqual(t3.pos.rowEnd, 1);
    assert.strictEqual(t3.pos.columnBegin, 5);
    assert.strictEqual(t3.pos.columnEnd, 10);
    assert.strictEqual(t3.text, 'foo\\"');
    assert.strictEqual(t3.kind, 'STRING_CONTENT');
    const t4 = t3.next;
    assert.strictEqual(t4.pos.index, 9);
    assert.strictEqual(t4.pos.rowBegin, 1);
    assert.strictEqual(t4.pos.rowEnd, 1);
    assert.strictEqual(t4.pos.columnBegin, 10);
    assert.strictEqual(t4.pos.columnEnd, 11);
    assert.strictEqual(t4.text, '"');
    assert.strictEqual(t4.kind, 'QUOTE');
    const t5 = t4.next;
    assert.strictEqual(t5, undefined);

});
