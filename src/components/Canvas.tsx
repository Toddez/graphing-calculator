import React, { createRef, useEffect, useState } from "react";

interface CanvasProps {
  expressionResults: Array<ExpressionResult>;
  updateResolution: UpdateResolution;
}

const getMousePos = (canvas: HTMLCanvasElement, position: Vector): Vector => {
  const rect = canvas.getBoundingClientRect();
  return [
    (position[0] - rect.left) * 2 - canvas.width,
    (position[1] - rect.top) * 2 - canvas.height,
  ];
};

const Canvas: React.FunctionComponent<CanvasProps> = ({
  expressionResults,
  updateResolution,
}) => {
  const [mouse, setMouse] = useState<MouseState>({
    down: false,
    position: [0, 0],
  });
  const [transform, setTransform] = useState<Transform>({
    position: [0, 0],
    scale: 0,
  });
  const canvasRef = createRef<HTMLCanvasElement>();

  const getContext = (): CanvasRenderingContext2D | undefined => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    return context;
  };

  const toCanvasSpace = (x: number, y: number): Vector => {
    const translated = [
      x / transform.scale - transform.position[0],
      y / transform.scale + transform.position[1],
    ];
    return translated;
  };

  const clear = () => {
    const ctx = getContext();

    if (!ctx) return;

    const parent = ctx.canvas.parentElement;
    if (!parent) return;

    ctx.canvas.width = parent?.clientWidth as number;
    ctx.canvas.height = parent?.clientHeight as number;

    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

    drawGrid(ctx);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    drawExpressions(ctx);
  };

  const getStepSize = (lines: number, min: number): number => {
    let scale = 1;
    let step = 0;
    let stop = false;
    if (min / lines >= 1)
      while (scale * lines < min && stop == false) {
        if (step > 2) step = 0;

        let change = 1;
        switch (step) {
          case 0:
            change = 2;
            break;
          case 1:
            change = 2.5;
            break;
          case 2:
            change = 2;
            break;
        }

        if (min / (scale * change) >= lines) scale *= change;
        else stop = true;

        step++;
      }
    else
      while (scale * lines > min) {
        if (step > 2) step = 0;

        switch (step) {
          case 0:
            scale /= 2;
            break;
          case 1:
            scale /= 2.5;
            break;
          case 2:
            scale /= 2;
            break;
        }

        step++;
      }

    return scale;
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const min = Math.max(ctx.canvas.width, ctx.canvas.height) * transform.scale;
    const step = getStepSize(15, min);

    const fontSize = 20;
    ctx.font = `${fontSize}px CascadiaCode`;
    const padding = 5;
    const offset = 5;

    let dir = 1;
    let index = 0;
    const posX =
      Math.round((transform.position[0] * transform.scale) / step) * step;
    for (
      let x = posX;
      x < posX + (ctx.canvas.width * transform.scale) / 2 + step;
      x += step * dir * index
    ) {
      ctx.strokeStyle = (x / step) % 5 == 0 ? "#555" : "#252525";
      ctx.beginPath();
      const pos0 = toCanvasSpace(
        x,
        -(transform.position[1] * transform.scale) -
          (ctx.canvas.height * transform.scale) / 2
      );
      const pos1 = toCanvasSpace(
        x,
        -(transform.position[1] * transform.scale) +
          (ctx.canvas.height * transform.scale) / 2
      );
      ctx.moveTo(pos0[0], pos0[1]);
      ctx.lineTo(pos1[0], pos1[1]);
      ctx.stroke();

      if ((x / step) % 5 == 0) {
        ctx.save();
        const pos = toCanvasSpace(x, 0);

        const measurements = ctx.measureText(x.toString());
        const textWidth = measurements.width;
        pos[0] +=
          pos[0] < 0
            ? -(textWidth - ctx.measureText(Math.abs(x).toString()).width) / 2
            : 0;
        pos[1] += offset;
        const textHeight = (fontSize + measurements.fontBoundingBoxDescent) / 2;

        ctx.fillStyle = "#aaa";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        if (x !== 0)
          ctx.fillText(
            x.toString(),
            Math.max(
              Math.min(pos[0], -textWidth / 2 - padding + ctx.canvas.width / 2),
              padding + textWidth / 2 - ctx.canvas.width / 2
            ),
            Math.max(
              Math.min(
                pos[1],
                -padding - textHeight - fontSize / 2 + ctx.canvas.height / 2
              ),
              padding +
                measurements.fontBoundingBoxDescent / 2 -
                ctx.canvas.height / 2
            )
          );
        ctx.restore();
      }

      dir *= -1;
      index++;
    }

    dir = 1;
    index = 0;
    const posY =
      Math.round((transform.position[1] * transform.scale) / step) * step;
    for (
      let y = posY;
      y < posY + (ctx.canvas.height * transform.scale) / 2 + step;
      y += step * dir * index
    ) {
      ctx.strokeStyle = (y / step) % 5 == 0 ? "#555" : "#252525";
      ctx.beginPath();
      const pos0 = toCanvasSpace(
        transform.position[0] * transform.scale -
          (ctx.canvas.width * transform.scale) / 2,
        -y
      );
      const pos1 = toCanvasSpace(
        transform.position[0] * transform.scale +
          (ctx.canvas.width * transform.scale) / 2,
        -y
      );
      ctx.moveTo(pos0[0], pos0[1]);
      ctx.lineTo(pos1[0], pos1[1]);
      ctx.stroke();

      if ((y / step) % 5 == 0) {
        ctx.save();
        const pos = toCanvasSpace(0, -y);
        pos[0] -= offset;
        const measurements = ctx.measureText(y.toString());
        const textWidth = measurements.width;
        const textHeight = (fontSize + measurements.fontBoundingBoxDescent) / 2;

        ctx.fillStyle = "#aaa";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        if (y !== 0)
          ctx.fillText(
            y.toString(),
            Math.max(
              Math.min(pos[0], -padding + ctx.canvas.width / 2),
              padding + textWidth - ctx.canvas.width / 2
            ),
            Math.max(
              Math.min(pos[1], -textHeight - padding + ctx.canvas.height / 2),
              padding + textHeight - ctx.canvas.height / 2
            )
          );
        ctx.restore();
      }

      dir *= -1;
      index++;
    }

    const x = (ctx.canvas.width * transform.scale) / 2;
    const y = (ctx.canvas.height * transform.scale) / 2;

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    const pos0 = toCanvasSpace(
      0,
      -(transform.position[1] * transform.scale) - y
    );
    const pos1 = toCanvasSpace(
      0,
      -(transform.position[1] * transform.scale) + y
    );
    const pos2 = toCanvasSpace(transform.position[0] * transform.scale - x, 0);
    const pos3 = toCanvasSpace(transform.position[0] * transform.scale + x, 0);
    ctx.moveTo(pos0[0], pos0[1]);
    ctx.lineTo(pos1[0], pos1[1]);
    ctx.moveTo(pos2[0], pos2[1]);
    ctx.lineTo(pos3[0], pos3[1]);
    ctx.stroke();

    ctx.save();
    const pos = toCanvasSpace(0, 0);
    ctx.fillStyle = "#aaa";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    ctx.fillText("0", pos[0] - offset, pos[1] + offset);
    ctx.restore();
  };

  const drawExpressions = (ctx: CanvasRenderingContext2D) => {
    for (const expressionResult of expressionResults) {
      const expression = expressionResult.expression;
      const results = expressionResult.result;

      if (expression.defines === "y") {
        ctx.strokeStyle = expression.color;
        ctx.beginPath();
        let index = 0;
        for (const result of results) {
          if (index + 1 >= results.length) continue;

          const current = result.scope.x;
          const next = results[index + 1].scope.x;
          let isDiscontinuous = false;
          for (const discon of expression.discontinuities) {
            if (current < discon && next > discon) isDiscontinuous = true;
          }

          if (isDiscontinuous) {
            const pos = toCanvasSpace(
              results[index + 1].scope.x,
              -results[index + 1].value
            );
            ctx.moveTo(pos[0], pos[1]);
          } else {
            const pos = toCanvasSpace(result.scope.x, -result.value);
            ctx.lineTo(pos[0], pos[1]);
          }

          index++;
        }

        ctx.stroke();
      }

      // TODO: Expression rendering should be generalized for any x and y
      //       Currently missing support for discontinuous expressions
      if (expression.defines === "x") {
        ctx.strokeStyle = expression.color;
        ctx.beginPath();
        for (const result of results) {
          const pos = toCanvasSpace(result.value, -result.scope.y);
          ctx.lineTo(pos[0], pos[1]);
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
    if (!ctx) return;

    updateResolution(transform, ctx.canvas.width, ctx.canvas.height);
  }, [transform]);

  useEffect(() => {
    const ctx = getContext();
    if (!ctx) return;

    const scaleCanvas = () => {
      setTransform({
        ...transform,
        scale: 10 / Math.min(ctx.canvas.width, ctx.canvas.height),
      });
    };

    window.addEventListener("resize", scaleCanvas);
    scaleCanvas();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={(ev) => {
        ev.preventDefault();
        const ctx = getContext();
        if (!ctx) return;

        setMouse({
          down: true,
          position: getMousePos(ctx.canvas, [ev.clientX, ev.clientY]),
        });
      }}
      onMouseMove={(ev) => {
        const ctx = getContext();
        if (!ctx) return;

        const pos = getMousePos(ctx.canvas, [ev.clientX, ev.clientY]);
        setMouse({ ...mouse, position: pos });
        if (mouse.down) {
          const delta = [
            -(pos[0] - mouse.position[0]),
            pos[1] - mouse.position[1],
          ];
          setTransform({
            ...transform,
            position: [
              transform.position[0] + delta[0] / 2,
              transform.position[1] + delta[1] / 2,
            ],
          });
          clear();
        }
      }}
      onMouseUp={(ev) => {
        const ctx = getContext();
        if (!ctx) return;

        setMouse({
          down: false,
          position: getMousePos(ctx.canvas, [ev.clientX, ev.clientY]),
        });
      }}
      onMouseLeave={() => {
        setMouse({ ...mouse, down: false });
      }}
      onWheel={(ev) => {
        const ctx = getContext();
        if (!ctx) return;

        let scale = transform.scale;
        const mouseInCanvasSpaceBefore = [
          (transform.position[0] + mouse.position[0] / 2) * scale,
          (transform.position[1] - mouse.position[1] / 2) * scale,
        ];
        scale *= 1 + ev.deltaY / ctx.canvas.height;

        const mouseInCanvasSpaceAfter = [
          (transform.position[0] + mouse.position[0] / 2) * scale,
          (transform.position[1] - mouse.position[1] / 2) * scale,
        ];

        const delta = [
          mouseInCanvasSpaceBefore[0] - mouseInCanvasSpaceAfter[0],
          mouseInCanvasSpaceBefore[1] - mouseInCanvasSpaceAfter[1],
        ];

        const newPosition = transform.position.slice();
        newPosition[0] += delta[0] / scale;
        newPosition[1] += delta[1] / scale;

        setTransform({ ...transform, scale: scale, position: newPosition });
        clear();
      }}
    />
  );
};

export { Canvas };
