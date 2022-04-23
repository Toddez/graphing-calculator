import React, { useEffect, useState } from "react";
import { Expression } from "./Expression";
import MathExpression from "math-expressions";
import "../style/expression.scss";
import { id } from "../utils";
interface ExpressionListProps {
  expressionsChange: ExpressionsChange;
}

export const ExpressionList: React.FunctionComponent<ExpressionListProps> = ({
  expressionsChange,
}) => {
  const [expressions, setExpressions] = useState<Array<Expression>>([]);

  const builtinVariables = new Set<Variable>(["x", "y", "e"]);

  const newExpression = () => ({
    id: id(),
    latex: "",
    code: "",
    defines: null,
    references: new Array<Variable>(),
    weight: 0,
    valid: false,
    color: "#ff0000",
    discontinuities: new Array<number>(),
  });

  const emptyExpression = newExpression();

  const selectColor = (index: number, max: number): string => {
    if (max < 1) max = 1;
    return `hsl(${(index * (360 / max)) % 360}, 100%, 50%)`;
  };

  const expressionProperties = (
    exprs: Array<Expression>,
    expr: Expression
  ): { valid: boolean; weight: number } => {
    for (const expression of exprs) {
      let insertionWeight = 0;
      let validExpr = true;
      for (const reference of Array.from(expression.references)) {
        let weight = 0;
        let noRef = !builtinVariables.has(reference);
        compare: for (const other of exprs) {
          if (other === expression) continue compare;

          if (other.defines === reference) {
            noRef = false;
            break compare;
          }

          weight++;
        }

        insertionWeight = Math.max(insertionWeight, weight);

        if (reference === expression.defines) validExpr = false;
        if (noRef == true) validExpr = false;
      }

      if (expression.code === "") validExpr = false;

      if (expr === expression)
        return { valid: validExpr, weight: insertionWeight };
    }

    return { valid: false, weight: 0 };
  };

  const orderExpressions = (): Array<Expression> => {
    const orderedExpressions = [...expressions];
    orderedExpressions.sort((a, b) => {
      return a.weight > b.weight ? 1 : -1;
    });

    return orderedExpressions;
  };

  const updateExpression: ExpressionChange = (id, latex) => {
    const newExpressions = expressions.map((expression) => {
      if (expression.id === id) {
        let defines;
        let references;
        let code;
        try {
          const latexNodes = MathExpression.fromLatex(latex);
          if (latexNodes.tree.indexOf("=") !== 0)
            throw new Error("No assignment operator");

          if (latexNodes.tree[1].length > 1)
            throw new Error("Invalid left-side of assignment operator");

          const variables = latexNodes.variables();
          if (variables.length < 1) defines = null;
          else defines = variables[0];

          if (variables.length < 2) references = new Array<Variable>();
          else references = Array.from(new Set(variables.slice(1)));

          code = latexNodes.toString();
        } catch {
          code = "";
          defines = null;
          references = new Array<Variable>();
        }

        return {
          ...expression,
          latex: latex,
          discontinuities: new Array<number>(),
          code: code,
          defines: defines,
          references: references,
        };
      }

      return {
        ...expression,
      };
    }) as Array<Expression>;

    const expressionsWithProperties = newExpressions.map((expr, index) => {
      const properties = expressionProperties(newExpressions, expr);

      return {
        ...expr,
        color: selectColor(index, expressions.length),
        valid: properties.valid,
        weight: properties.weight,
      };
    });

    setExpressions(expressionsWithProperties);
  };

  const deleteExpression: ExpressionDelete = (id) => {
    const newExpressions = expressions.filter((expression) => {
      return id !== expression.id;
    });
    setExpressions(newExpressions);
  };

  const createExpression: ExpressionCreate = () => {
    setExpressions([...expressions, newExpression()]);
  };

  useEffect(() => {
    expressionsChange(orderExpressions());
  }, [expressions]);

  useEffect(() => {
    if (expressions.length === 0) setExpressions([newExpression()]);
  }, []);

  return (
    <div className="expression-list">
      {expressions.map((expression: Expression, index) => {
        return (
          <Expression
            key={expression.id}
            label={(index + 1) as unknown as string}
            expression={expression}
            expressionChange={updateExpression}
            expressionDelete={deleteExpression}
          />
        );
      })}
      <Expression
        key={emptyExpression.id}
        label={(expressions.length + 1) as unknown as string}
        expression={emptyExpression}
        expressionCreate={createExpression}
      />
    </div>
  );
};
