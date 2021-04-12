import React from 'react';
import { Canvas } from './Canvas';
import '../style/graph.scss';

export const Graph: React.FunctionComponent = () => {
    return (
        <div className='graph-container'>
            <Canvas />
        </div>
    );
};
