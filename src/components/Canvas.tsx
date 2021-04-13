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

        ctx.strokeStyle = '#111';
        ctx.lineWidth = transform.scale;
        drawGrid(ctx);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = transform.scale;
        drawExpressions(ctx);
    };

    const getStepSize = (lines: number, min: number) : number => {
        let scale = 1;
        let step = 0;
        let stop = false;
        if (min / lines >= 1)
            while (scale * lines < min && stop == false) {
                if (step > 2)
                    step = 0;

                let change = 1;
                switch (step) {
                    case 0: change = 2; break;
                    case 1: change = 2.5; break;
                    case 2: change = 2; break;
                }

                if (min / (scale * change) >= lines)
                    scale *= change;
                else
                    stop = true;

                step++;
            }
        else
            while (scale * lines > min) {
                if (step > 2)
                    step = 0;

                switch (step) {
                    case 0: scale /= 2; break;
                    case 1: scale /= 2.5; break;
                    case 2: scale /= 2; break;
                }

                step++;
            }

        return scale;
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        const min = Math.max(ctx.canvas.width, ctx.canvas.height) * transform.scale;
        const step = getStepSize(15, min);

        let dir = 1;
        let index = 0;
        const posX = Math.round((transform.position[0] * transform.scale) / step) * step;
        for (let x = posX; x < posX + (ctx.canvas.width * transform.scale) / 2 + step; x += step * dir * index) {
            ctx.beginPath();
            if ((x / step) % 5 == 0) {
                ctx.strokeStyle = '#444';
            }
            else
                ctx.strokeStyle = '#151515';

            ctx.moveTo(x, -(transform.position[1] * transform.scale) - (ctx.canvas.height * transform.scale) / 2);
            ctx.lineTo(x, -(transform.position[1] * transform.scale) + (ctx.canvas.height * transform.scale) / 2);
            ctx.stroke();
            dir *= -1;
            index++;
        }

        dir = 1;
        index = 0;
        const posY = Math.round((transform.position[1] * transform.scale) / step) * step;
        for (let y = posY; y < posY + (ctx.canvas.height * transform.scale) / 2 + step; y += step * dir * index) {
            ctx.beginPath();
            if ((y / step) % 5 == 0) {
                ctx.strokeStyle = '#444';
            }
            else
                ctx.strokeStyle = '#151515';

            ctx.moveTo((transform.position[0] * transform.scale) - (ctx.canvas.width * transform.scale) / 2, -y);
            ctx.lineTo((transform.position[0] * transform.scale) + (ctx.canvas.width * transform.scale) / 2, -y);
            ctx.stroke();
            dir *= -1;
            index++;
        }


        const x = (ctx.canvas.width * transform.scale) / 2;
        const y = (ctx.canvas.height * transform.scale) / 2;

        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -(transform.position[1] * transform.scale) - y);
        ctx.lineTo(0, -(transform.position[1] * transform.scale) + y);
        ctx.moveTo((transform.position[0] * transform.scale) - x, 0);
        ctx.lineTo((transform.position[0] * transform.scale) + x, 0);
        ctx.stroke();
    };

    const drawExpressions = (ctx: CanvasRenderingContext2D) => {
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
