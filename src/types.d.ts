
type Variable = string;

type Expression = {
    latex: string,
    code: string,
    defines: Variable | null,
    references: Set<Variable>,
    weight: number,
    valid: boolean
};

type ExpressionChange = (expression: Expression, latex: string) => void;
type ExpressionDelete = (expression: Expression) => void;
type ExpressionCreate = () => void;
