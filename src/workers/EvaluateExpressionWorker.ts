import { evaluate } from 'mathjs';

export function processData(data: string): string {
    const parsedData = JSON.parse(data);

    const expressions = parsedData.expressions;
    const scope = parsedData.scope;

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
            for (let i = scopeVar.min; i <= scopeVar.max; i += scopeVar.step) {
                const evalScope: Record<string, number> = {};
                evalScope[variable] = i;

                const results = evaluate(evalExpressions.map((expr: Expression) => expr.code), evalScope);
                let evalIndex = 0;
                for (let index = 0; index < expressions.length; index++)
                    if (evalExpressions.includes(expressions[index]))
                        outData.expressionResults[index].result = [...outData.expressionResults[index].result, { value: results[evalIndex++], scope: evalScope } ];
            }
        } catch {
            console.warn('Failed to evaluate expressions');
        }
    }

    return JSON.stringify(outData);
}
