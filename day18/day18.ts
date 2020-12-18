import { isDefined, readInputLines } from "../shared/utils";

type Token
    = { type: 'lit', value: `${number}` }
    | { type: 'add' }
    | { type: 'mul' }
    | { type: 'lpar' }
    | { type: 'rpar' }

type Expr
    = { type: 'lit', value: number }
    | { type: 'add', left: Expr, right: Expr }
    | { type: 'mul', left: Expr, right: Expr }

const tokenize = (line: string): Token[] => {
    return line.split(' ').flatMap<Token>(w => {
        if (w === '+') {
            return ['add' as const];
        }

        if (w === '*') {
            return ['mul' as const];
        }

        if (w.startsWith('(')) {
            return ['lpar' as const, w.slice(1) as `${number}`];
        }

        if (w.endsWith(')')) {
            return [w.slice(0, w.length - 1) as `${number}`, 'rpar' as const];
        }

        return [w as `${number}`];
    });
};

const parseRhs = (tokens: Token[]): [Expr | undefined, Token[]] => {
    const [top, ...rest] = tokens;
    if (top.type === 'lit') {
        return [
            { type: 'lit', value: parseInt(top.value, 10) },
            rest
        ];
    }

    if (top.type === 'lpar') {
        const idx = tokens.findIndex(t => t.type === 'rpar');
        if (idx !== -1) {
            return parseExpr(tokens.slice(0, idx));
        }
    }

    return [undefined, tokens];
};

const parseLhs = (tokens: Token[]): [Expr | undefined, Token[]] => {
    const [top, ...rest] = tokens;
    if (top.type === 'lit') {
        return [
            { type: 'lit', value: parseInt(top.value, 10) },
            rest
        ];
    }

    return [undefined, tokens];
};

const parseExpr = (tokens: Token[]): [Expr | undefined, Token[]] => {
    const [left, a] = parseLhs(tokens);
    if (!isDefined(left)) {
        throw new SyntaxError(`Syntax error`);
    }

    const [op, ...b] = a;
    if (op.type !== 'add' && op.type !== 'mul') {
        throw new SyntaxError(`Syntax error`);
    }

    const [right, c] = parseRhs(b);
    if (!isDefined(right)) {
        throw new SyntaxError(`Syntax error`);
    }

    return [{ type: op.type, left, right }, c];
};

const parse = (tokens: Token[]): Expr => {
    const [expr] = parseExpr(tokens);
    if (!isDefined(expr)) {
        throw new SyntaxError(`Syntax Error`);
    }

    return expr;
};

const read = (line: string): Expr => parse(tokenize(line));

const run = (expr: Expr): number => {
    switch (expr.type) {
        case 'lit':
            return expr.value;
        case 'add':
            return run(expr.left) + run(expr.right);
        case 'mul':
            return run(expr.left) * run(expr.right);
    }
};

const part1 = (exprs: Expr[]): number =>
    exprs.map(run).reduce((acc, curr) => acc * curr);

(async () => {
    const lines = await readInputLines('day18');
    const exprs = lines.map(read);

    console.log(part1([
        {
            type: 'add',
            left: { type: 'lit', value: 1 },
            right: {
                type: 'add',
                left: {
                    type: 'mul',
                    left: { type: 'lit', value: 2 },
                    right: { type: 'lit', value: 3 }
                },
                right: {
                    type: 'mul',
                    left: { type: 'lit', value: 4 },
                    right: {
                        type: 'add',
                        left: { type: 'lit', value: 5 },
                        right: { type: 'lit', value: 6 }
                    }
                }
            }
        }
    ]));
    // console.log(part1(exprs));
})();