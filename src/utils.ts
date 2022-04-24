let idCounter = 0;
export const id: () => number = () => idCounter++;

export const newExpression = (identifier: number | (() => number) = id) => ({
  id: typeof identifier === "number" ? identifier : identifier(),
  latex: "",
  code: "",
  defines: null,
  references: new Array<Variable>(),
  weight: 0,
  valid: false,
  color: "#ff0000",
  discontinuities: new Array<number>(),
});

export const saveExpressions = (expressions: Array<Expression>) => {
  try {
    localStorage.setItem("expressions", JSON.stringify(expressions));
    // eslint-disable-next-line no-empty
  } catch {}
};

export const loadExpressions = () => {
  try {
    const expressions = JSON.parse(
      localStorage.getItem("expressions") as string
    ) as Array<Expression>;

    idCounter = expressions.reduce(
      (max, expression) => Math.max(max, expression.id + 1),
      0
    );

    if (expressions.length === 0) expressions.push(newExpression());

    return expressions;
  } catch {
    return [newExpression()];
  }
};
