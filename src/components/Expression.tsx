import React, { useState } from "react";
import { addStyles, EditableMathField } from "react-mathquill";
import ClearIcon from "@material-ui/icons/ClearRounded";
import LineIcon from "@material-ui/icons/ShowChartRounded";
import ErrorIcon from "@material-ui/icons/PriorityHighRounded";

addStyles();

interface ExpressionProps {
  expression: Expression;
  label: string;
  expressionChange?: ExpressionChange;
  expressionDelete?: ExpressionDelete;
  expressionCreate?: ExpressionCreate;
}

const Expression: React.FunctionComponent<ExpressionProps> = ({
  expression,
  label,
  expressionChange,
  expressionDelete,
  expressionCreate,
}) => {
  const [latex, setLatex] = useState(expression.latex);

  return (
    <div
      className={`expression${expressionCreate ? " expression-create" : ""}`}
      onClick={
        expressionCreate
          ? () => {
              expressionCreate();
            }
          : undefined
      }
    >
      <div className="expression-label">
        <span className="label-text">{label}</span>
        <span className="label-icon">
          {expression.valid &&
          expression.defines &&
          ["x", "y"].includes(expression.defines) ? (
            <LineIcon style={{ color: expression.color }} />
          ) : null}
        </span>
      </div>
      {expressionChange ? (
        <EditableMathField
          className="expression-text"
          latex={latex}
          mathquillDidMount={(mathField) => {
            if (expression.latex === "") mathField.focus();
          }}
          onChange={(mathField) => {
            const res = mathField.latex();
            if (expressionChange) expressionChange(expression.id, res);
            setLatex(res);
          }}
        />
      ) : (
        <div className="expression-text"></div>
      )}
      {expressionDelete ? (
        <div
          className="expression-delete"
          onClick={() => {
            if (expressionDelete) expressionDelete(expression.id);
          }}
        >
          <ClearIcon />
        </div>
      ) : null}
    </div>
  );
};

export { Expression };
