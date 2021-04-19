function slope(x1: number, y1: number, x2: number, y2: number) {
    return (y2 - y1) / (x2 - x1);
}

function findDiscontinuity(leftX: number, rightX: number, fn: ((x: number) => number)) : number | null {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        let leftY = fn(leftX);
        let rightY = fn(rightX);
        const middleX = (leftX + rightX) / 2;
        const middleY = fn(middleX);
        const leftSlope = Math.abs(slope(leftX, leftY, middleX, middleY));
        const rightSlope = Math.abs(slope(middleX, middleY, rightX, rightY));

        if (middleX === leftX || middleX === rightX) return null;

        if (!isFinite(leftSlope) || !isFinite(rightSlope)) return middleX;

        if (leftSlope > rightSlope) {
            rightX = middleX;
            rightY = middleY;
        } else {
            leftX = middleX;
            leftY = middleY;
        }
    }

    return null;
}

export { findDiscontinuity };
