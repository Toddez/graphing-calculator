import { evaluate } from 'mathjs';
import memoize from 'memoizee';
import { findDiscontinuity } from '../models/discon';

const evaluateExpressions = memoize(
    (expressions: Array<string>, scope: Record<string, number>) : Array<number> => {
        return evaluate(expressions, scope);
    },
    {
        primitive: true,
        normalizer: (args) => {
            return args[0].join() + JSON.stringify(args[1]);
        }
    }
);

export const processData = (data: string) : string => {
    const parsedData = JSON.parse(data);

    const expressions = parsedData.expressions;
    const scope = parsedData.scope;
    const size = parsedData.size;

    const outData = {
        expressionResults: new Array<ExpressionResult>()
    };
    for (const expression of expressions) {
        outData.expressionResults.push({
            expression: expression as Expression,
            result: new Array<Result>()
        });
    }

    const scopeVars = Object.keys(scope);
    for (const variable of scopeVars) {
        scope[variable].value = scope[variable].min;
        scope[variable].defines = new Array<Variable>();

        for (const expression of expressions) {
            if (expression.references.includes(variable)) {
                scope[variable].defines.push(expression);
            }
        }
    }

    console.time('eval');

    for (const variable of scopeVars) {
        const scopeVar = scope[variable];

        const evalExpressions = [...scopeVar.defines];
        extraExpressions: for (const expression of expressions) {
            if (expression.defines === variable)
                continue extraExpressions;

            if (expression.references.some((value: string) => scopeVars.includes(value)))
                continue extraExpressions;

            evalExpressions.unshift(expression);
        }

        try {
            let evalIndex = 0;
            const originalStep = scopeVar.step;
            for (let i = scopeVar.min; i <= scopeVar.max; i += scopeVar.step) {
                const evalScope: Record<string, number> = {};
                evalScope[variable] = i;

                const results = evaluateExpressions(evalExpressions.map((expr: Expression) => expr.code), evalScope);
                let exprIndex = 0;
                let delta = 0;
                for (let index = 0; index < expressions.length; index++)
                    if (evalExpressions.includes(expressions[index])) {
                        const fn = memoize((x: number) : number => {
                            const sc: Record<string, number> = {};
                            Object.assign(sc, evalScope);
                            sc.x = x;
                            const results2 = evaluateExpressions(evalExpressions.map((expr: Expression) => expr.code), sc);
                            return results2[exprIndex];
                        },
                        {
                            primitive: true
                        });

                        const discon = findDiscontinuity(i - scopeVar.step, i, fn);
                        if (discon)
                            outData.expressionResults[index].expression.discontinuities.push(discon);

                        const value = results[exprIndex++];
                        if (evalIndex > 0)
                            delta = Math.min(delta, (value - outData.expressionResults[index].result[evalIndex - 1].value));

                        outData.expressionResults[index].result = [...outData.expressionResults[index].result, { value: value, scope: evalScope } ];
                    }

                scopeVar.step *= delta > originalStep ? 2 : 0.5;
                scopeVar.step = Math.max(scopeVar.step, (scopeVar.max - scopeVar.min) / Math.max(...size));
                evalIndex++;
            }

        } catch {
            console.warn('Failed to evaluate expressions');
        }

    }

    console.timeEnd('eval');

    return JSON.stringify(outData);
};
