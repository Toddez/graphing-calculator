import React, { useEffect, useState } from "react";
import { ExpressionList } from "./ExpressionList";
import { Graph } from "./Graph";
import { EvaluateExpressionWorker } from "../workers";
import "../style/main.scss";

type Scope = {
  [key: string]: {
    min: number;
    max: number;
    step: number;
  };
};

const instance = new EvaluateExpressionWorker();
export const Main: React.FunctionComponent = () => {
  const [expressionResults, setExpressionResults] = useState<
    Array<ExpressionResult>
  >([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [expressions, setExpressions] = useState<Array<Expression>>([]);
  const [scope, setScope] = useState<Scope | null>(null);

  const expressionsChanged: ExpressionsChange = (newExpressions) => {
    setExpressions(newExpressions);
  };

  const updateResolution = (
    transform: Transform,
    width: number,
    height: number
  ) => {
    if (transform.scale === 0) return;

    const x = {
      min: (transform.position[0] - width / 2) * transform.scale,
      max: (transform.position[0] + width / 2) * transform.scale,
      step: transform.scale * 2,
    };
    const y = {
      min: (transform.position[1] - height / 2) * transform.scale,
      max: (transform.position[1] + height / 2) * transform.scale,
      step: transform.scale * 2,
    };

    if (scope) setScope({ ...scope, x, y });
    else setScope({ x, y });
  };

  useEffect(() => {
    const evaluateExpressions = async () => {
      if (isEvaluating) return;
      if (!scope) return;

      const data = {
        expressions: expressions,
        scope,
      };

      setIsEvaluating(true);
      setExpressionResults(
        JSON.parse(await instance.processData(JSON.stringify(data)))
          .expressionResults
      );
      setIsEvaluating(false);
    };

    evaluateExpressions();
  }, [scope, expressions]);

  return (
    <main className="main">
      <ExpressionList expressionsChange={expressionsChanged} />
      <Graph
        expressionResults={expressionResults}
        updateResolution={updateResolution}
      />
    </main>
  );
};
