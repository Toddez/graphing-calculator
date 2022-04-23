type Variable = string;

type Vector = Array<number>;

type Expression = {
  latex: string;
  code: string;
  defines: Variable | null;
  references: Array<Variable>;
  weight: number;
  valid: boolean;
  color: string;
  discontinuities: Array<number>;
};

type Result = {
  // TODO: value should be part of scope
  value: number;
  scope: Record<string, number>;
};

type ExpressionResult = {
  expression: Expression;
  result: Array<Result>;
};

type Transform = {
  position: Vector;
  scale: number;
};

type MouseState = {
  down: boolean;
  position: Vector;
};

type ExpressionChange = (expression: Expression, latex: string) => void;
type ExpressionDelete = (expression: Expression) => void;
type ExpressionCreate = () => void;

type ExpressionsChange = (expressions: Array<Expression>) => void;

type UpdateResolution = (
  transform: Transform,
  width: number,
  height: number
) => void;
