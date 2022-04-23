import { evaluate } from "mathjs";
import memoize from "memoizee";

const evaluateExpressions = memoize(
  (
    expressions: Array<string>,
    scope: Record<string, number>
  ): Array<number> => {
    return evaluate(expressions, scope);
  },
  {
    primitive: true,
    normalizer: (args) => {
      return args[0].join() + JSON.stringify(args[1]);
    },
  }
);

export const processData = (data: string): string => {
  const parsedData = JSON.parse(data);

  const expressions = parsedData.expressions;
  const scope = parsedData.scope;

  const outData = {
    expressionResults: new Array<ExpressionResult>(),
  };
  for (const expression of expressions) {
    outData.expressionResults.push({
      expression: expression as Expression,
      result: new Array<Result>(),
    });
  }

  const scopeVars = Object.keys(scope);
  for (const variable of scopeVars) {
    scope[variable].value = scope[variable].min;
    scope[variable].defines = new Array<Variable>();

    for (const expression of expressions) {
      if (expression.references.includes(variable)) {
        if (expression.valid) scope[variable].defines.push(expression);
      }
    }
  }

  console.time("eval");

  for (const variable of scopeVars) {
    const scopeVar = scope[variable];

    const evalExpressions = [...scopeVar.defines];
    let insertionIndex = 0;
    extraExpressions: for (const expression of expressions) {
      if (expression.defines === variable) continue extraExpressions;

      if (
        expression.references.some((value: string) => scopeVars.includes(value))
      )
        continue extraExpressions;

      if (expression.valid)
        evalExpressions.splice(insertionIndex++, 0, expression);
    }

    try {
      for (let i = scopeVar.min; i <= scopeVar.max; i += scopeVar.step) {
        const evalScope: Record<string, number> = {};
        evalScope[variable] = i;

        const results = evaluateExpressions(
          evalExpressions.map((expr: Expression) => expr.code),
          evalScope
        );
        let exprIndex = 0;
        for (let index = 0; index < expressions.length; index++)
          if (evalExpressions.includes(expressions[index]))
            outData.expressionResults[index].result = [
              ...outData.expressionResults[index].result,
              { value: results[exprIndex++], scope: evalScope },
            ];
      }
    } catch {
      console.warn("Failed to evaluate expressions");
    }
  }

  console.timeEnd("eval");

  return JSON.stringify(outData);
};
