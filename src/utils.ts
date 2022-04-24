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
