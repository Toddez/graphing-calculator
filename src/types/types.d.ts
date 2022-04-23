type Variable = string;

type Vector = Array<number>;

type Expression = {
  id: number;
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

type ExpressionChange = (id: number, latex: string) => void;
type ExpressionDelete = (id: number) => void;
type ExpressionCreate = () => void;

type ExpressionsChange = (expressions: Array<Expression>) => void;

type UpdateResolution = (
  transform: Transform,
  width: number,
  height: number
) => void;
