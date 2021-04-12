import React, { createRef, useEffect } from 'react';

const Canvas: React.FunctionComponent = () => {
    const canvasRef = createRef<HTMLCanvasElement>();

    const clear = (ctx: CanvasRenderingContext2D) => {
        const parent = ctx.canvas.parentElement;
        if (!parent)
            return;

        ctx.canvas.width = parent?.offsetWidth as number;
        ctx.canvas.height = parent?.offsetHeight as number;

        ctx.fillStyle = '#000000'; // TODO: Configurable style
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);

        // FIXME: remove, just temp
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, 2 * Math.PI);
        ctx.fill();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;

        const context = canvas.getContext('2d');
        if (!context)
            return;

        clear(context);
    }, []);

    return (
        <canvas ref={canvasRef} />
    );
};

export { Canvas };
