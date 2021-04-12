type Expression = {
    latex: string
};

type ExpressionChange = (expression: Expression, latex: string) => void;
type ExpressionDelete = (expression: Expression) => void;
type ExpressionCreate = () => void;
