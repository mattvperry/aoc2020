import { mapAsync, reduceAsync, streamInputLinesAsync } from "../shared/utils";

type Operator = '+' | '*';

type Token
    = { type: 'lit', value: string }
    | { type: 'bin', op: Operator }
    | { type: 'lpar', op: '(' }
    | { type: 'rpar', op: ')' }

type Expr
    = { type: 'lit', value: bigint }
    | { type: '+', left: Expr, right: Expr }
    | { type: '*', left: Expr, right: Expr }

type Precedence = (op: Operator | '(' | ')' | undefined) => number;

const tokenize = (line: string): Token[] => {
    return line.split(' ').flatMap<Token>(w => {
        if (w === '+' || w === '*') {
            return [{ type: 'bin', op: w }];
        }

        if (w.startsWith('(')) {
            return [{ type: 'lpar', op: '(' }, ...tokenize(w.slice(1))];
        }

        if (w.endsWith(')')) {
            return [...tokenize(w.slice(0, w.length - 1)), { type: 'rpar', op: ')' }];
        }

        return [{ type: 'lit', value: w }];
    });
};

const shunt = (
    tokens: Token[],
    output: Expr[],
    ops: Exclude<Token, { type: 'lit' }>[],
    p: Precedence
): Expr => {
    if (output.length === 1
        && ops.length === 0
        && tokens.length === 0) {
            return output[0];
    }

    const [token, ...remainingTokens] = tokens;
    if (token?.type === 'lpar') {
        return shunt(remainingTokens, output, [token, ...ops], p);
    }

    const [op, ...remainingOps] = ops;
    if (op?.type === 'lpar' && token?.type === 'rpar') {
        return shunt(remainingTokens, output, remainingOps, p);
    }

    if (token?.type === 'bin' && p(op?.op) < p(token?.op)) {
        return shunt(remainingTokens, output, [token, ...ops], p);
    }

    if (token?.type === 'lit') {
        return shunt(remainingTokens, [{ type: 'lit', value: BigInt(token.value) }, ...output], ops, p);
    }

    if (op?.type === 'bin') {
        const [left, right, ...remainingOutput] = output;
        return shunt(tokens, [{ type: op.op, left, right }, ...remainingOutput], remainingOps, p);
    }

    throw SyntaxError();
}

const run = (expr: Expr): bigint => {
    switch (expr.type) {
        case 'lit':
            return expr.value;
        case '+':
            return run(expr.left) + run(expr.right);
        case '*':
            return run(expr.left) * run(expr.right);
    }
};

const evalTokens = (tokens: Token[], p: Record<Operator, number>) =>
    run(shunt(tokens, [], [], c => {
        switch (c) {
            case '+':
            case '*':
                return p[c];
            case '(':
            case undefined:
                return 0;
            default:
                throw new SyntaxError(`Unexpected token: ${c}`);
        }
    }));

const day18 = (tokens: AsyncIterable<Token[]>) => {
    return reduceAsync(tokens, [0n, 0n], async ([p1, p2], curr) => [
        p1 + evalTokens(curr, { '+': 1, '*': 1 }),
        p2 + evalTokens(curr, { '+': 2, '*': 1 }),
    ]);
};

(async () => {
    const lines = streamInputLinesAsync('day18');
    const tokens = mapAsync(lines, async l => tokenize(l));

    const [part1, part2] = await day18(tokens);
    console.log(part1);
    console.log(part2);
})();