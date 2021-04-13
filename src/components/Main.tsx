import React, { useState } from 'react';
import { ExpressionList } from './ExpressionList';
import { Graph } from './Graph';
import { EvaluateExpressionWorker } from '../workers';
import '../style/main.scss';

const instance = new EvaluateExpressionWorker();
export const Main: React.FunctionComponent = () => {
    const [expressionResults, setExpressionResults] = useState<Array<ExpressionResult>>([]);
    const [expressions, setExpressions] = useState<Array<Expression>>([]);
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

    const [scope, setScope] = useState({
        x: {
            min: -1,
            max: 1,
            step:  1
        },
        y: {
            min: -1,
            max: 1,
            step:  1
        }
    });

    const expressionsChanged: ExpressionsChange = async (newExpressions) => {
        if (isEvaluating)
            return;

        setIsEvaluating(true);
        setExpressions(newExpressions);
        setExpressionResults(await evaluateExpressions(newExpressions));
        setIsEvaluating(false);
    };

    const evaluateExpressions = async (expressions: Array<Expression>) : Promise<Array<ExpressionResult>> => {
        const data = {
            expressions: expressions,
            scope
        };

        const processedData = JSON.parse(await instance.processData(JSON.stringify(data)));
        return processedData.expressionResults;
    };

    return (
        <main className='main'>
            <ExpressionList expressionsChange={expressionsChanged} />
            <Graph expressionResults={expressionResults} updateResolution={(transform, width, height) => {
                const x = {
                    min: (transform.position[0] - width/2) * transform.scale,
                    max: (transform.position[0] + width/2) * transform.scale,
                    step: transform.scale
                };
                const y = {
                    min: (transform.position[1] - height/2) * transform.scale,
                    max: (transform.position[1] + height/2) * transform.scale,
                    step: transform.scale
                };
                setScope({ ...scope, x, y });
                expressionsChanged(expressions);
            }} />
        </main>
    );
};
