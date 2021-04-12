import React from 'react';
import { ExpressionList } from './ExpressionList';
import { Graph } from './Graph';
import { EvaluateExpressionWorker } from '../workers';
import '../style/main.scss';

export const Main: React.FunctionComponent = () => {
    const expressionsChanged: ExpressionsChange = (expressions) => {
        evaluateExpressions(expressions);
    };

    const evaluateExpressions = async (expressions: Array<Expression>) => {
        const instance = new EvaluateExpressionWorker();
        const data = {
            expressions: expressions,
            scope: {
                x: {
                    min: -1920/2,
                    max: 1920/2,
                    step:  1
                },
                y: {
                    min: -1080/2,
                    max: 1080/2,
                    step:  1
                }
            }
        };

        const processed = JSON.parse(await instance.processData(JSON.stringify(data)));
        console.log('Results:', processed);
    };

    return (
        <main className='main'>
            <ExpressionList expressionsChange={expressionsChanged} />
            <Graph />
        </main>
    );
};
