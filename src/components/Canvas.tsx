import React, { createRef, useEffect, useState } from 'react';

interface CanvasProps {
    expressionResults: Array<ExpressionResult>,
    updateResolution: UpdateResolution
}

const getMousePos = (canvas: HTMLCanvasElement, position: Vector) : Vector => {
    const rect = canvas.getBoundingClientRect();
    return [
        (position[0] - rect.left) * 2 - canvas.width,
        (position[1] - rect.top) * 2 - canvas.height
    ];
};

const Canvas: React.FunctionComponent<CanvasProps> = ({ expressionResults, updateResolution }) => {
    const [mouse, setMouse] = useState<MouseState>({
        down: false,
        position: [0, 0],
    });
    const [transform, setTransform] = useState<Transform>({
        position: [0, 0],
        scale: 1
    });
    const canvasRef = createRef<HTMLCanvasElement>();

    const getContext = () : CanvasRenderingContext2D | undefined => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;

        const context = canvas.getContext('2d');
        if (!context)
            return;

        return context;
    };

    const clear = () => {
        const ctx = getContext();

        if (!ctx)
            return;

        const parent = ctx.canvas.parentElement;
        if (!parent)
            return;

        ctx.canvas.width = parent?.clientWidth as number;
        ctx.canvas.height = parent?.clientHeight as number;

        ctx.fillStyle = '#000000'; // TODO: Configurable style
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);

        ctx.translate(-transform.position[0], transform.position[1]);
        ctx.scale(1 / transform.scale, 1 / transform.scale);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = transform.scale;
        draw(ctx);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        for (const expressionResult of expressionResults) {
            const expression = expressionResult.expression;
            const results = expressionResult.result;

            if (expression.defines === 'y') {
                ctx.beginPath();
                for (const result of results) {
                    ctx.lineTo(result.scope.x, -result.value);
                }
                ctx.stroke();
            }

            if (expression.defines === 'x') {
                ctx.beginPath();
                for (const result of results) {
                    ctx.lineTo(result.value, -result.scope.y);
                }
                ctx.stroke();
            }
        }
    };

    useEffect(() => {
        clear();
    }, [expressionResults]);

    useEffect(() => {
        const ctx = getContext();
        if (!ctx)
            return;

        updateResolution(transform, ctx.canvas.width, ctx.canvas.height);
    }, [transform]);

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={(ev) => {
                const ctx = getContext();
                if (!ctx)
                    return;

                setMouse({ down: true, position: getMousePos(ctx.canvas, [ev.clientX, ev.clientY]) });
            }}
            onMouseMove={(ev) => {
                const ctx = getContext();
                if (!ctx)
                    return;

                const pos = getMousePos(ctx.canvas, [ev.clientX, ev.clientY]);
                setMouse({ ...mouse, position: pos });
                if (mouse.down) {
                    const delta = [-(pos[0] - mouse.position[0]), (pos[1] - mouse.position[1])];
                    setTransform({ ...transform, position: [transform.position[0] + delta[0] / 2, transform.position[1] + delta[1] / 2]});
                    clear();
                }
            }}
            onMouseUp={(ev) => {
                const ctx = getContext();
                if (!ctx)
                    return;

                setMouse({ down: false, position: getMousePos(ctx.canvas, [ev.clientX, ev.clientY]) });
            }}
            onWheel={(ev) => {
                const ctx = getContext();
                if (!ctx)
                    return;

                let scale = transform.scale;
                const mouseInCanvasSpaceBefore = [
                    mouse.position[0] * scale,
                    mouse.position[1] * scale
                ];
                scale *= 1 + (ev.deltaY / ctx.canvas.height);

                const position = transform.position;
                const mouseInCanvasSpaceAfter = [
                    mouse.position[0] * scale,
                    mouse.position[1] * scale
                ];

                const delta = [
                    mouseInCanvasSpaceBefore[0] - mouseInCanvasSpaceAfter[0],
                    mouseInCanvasSpaceBefore[1] - mouseInCanvasSpaceAfter[1]
                ];

                position[0] -= (delta[0] / 2) / scale;
                position[1] += (delta[1] / 2) / scale;

                setTransform({ ...transform, scale: scale, position: position });
                clear();
            }}
        />
    );
};

export { Canvas };
