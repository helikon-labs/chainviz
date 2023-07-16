interface Point {
    x: number;
    y: number;
}

interface Bezier {
    cp1: Point;
    cp2: Point;
    p2: Point;
}

interface Text {
    text: string;
    center: Point;
}

type Path = (Point | Bezier)[];

class Logo {
    readonly logoAnimCanvas: HTMLCanvasElement;
    readonly logoAnimContext: CanvasRenderingContext2D;

    constructor() {
        this.logoAnimCanvas = <HTMLCanvasElement>document.getElementById('logo-anim');
        this.logoAnimContext = (<HTMLCanvasElement>document.getElementById('logo-anim')).getContext(
            '2d'
        )!;
    }

    async draw() {
        const scale = 1;
        const width = 120 * scale;
        const height = 120 * scale;
        const letterBoxWidth = 28 * scale;
        const bezierOffset = 20 * scale;
        const fontSize = 18 * scale;
        const lineWidth = 1.65 * scale;

        const dpi = window.devicePixelRatio;
        this.logoAnimCanvas.width = width * dpi;
        this.logoAnimCanvas.height = height * dpi;
        this.logoAnimCanvas.style.width = width + 'px';
        this.logoAnimCanvas.style.height = height + 'px';

        const ctx = this.logoAnimContext;
        ctx.scale(dpi, dpi);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.lineWidth = lineWidth;
        ctx.clearRect(0, 0, this.logoAnimCanvas.width, this.logoAnimCanvas.height);

        const font = new FontFace('Mont', 'url(./font/mont/Mont-Trial-Regular.otf)');
        await font.load();
        ctx.font = `${fontSize}px Mont`;
        this.drawVar6(ctx, width, height, letterBoxWidth, bezierOffset);
    }

    drawPath(ctx: CanvasRenderingContext2D, path: Path) {
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            let element = path[i];
            if (i == 0) {
                let point = element as Point;
                ctx.moveTo(point.x, point.y);
            } else if ('cp1' in element) {
                ctx.bezierCurveTo(
                    element.cp1.x,
                    element.cp1.y,
                    element.cp2.x,
                    element.cp2.y,
                    element.p2.x,
                    element.p2.y
                );
            } else {
                ctx.lineTo(element.x, element.y);
            }
        }
        ctx.stroke();
    }

    drawText(ctx: CanvasRenderingContext2D, text: Text) {
        const tMetrics = ctx.measureText(text.text);
        const tW = tMetrics.width;
        const tH = tMetrics.actualBoundingBoxAscent + tMetrics.actualBoundingBoxDescent;
        ctx.fillText(text.text, text.center.x - tW / 2, text.center.y - tH / 2);
    }

    drawVar0(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(ctx, {
            text: 'C',
            center: {
                x: letterBoxWidth / 2,
                y: letterBoxWidth / 2,
            },
        });
        let path: Path = [
            { x: letterBoxWidth, y: letterBoxWidth / 2 },
            { x: width / 2 - bezierOffset, y: letterBoxWidth / 2 },
            {
                cp1: { x: width / 2 - bezierOffset / 3, y: letterBoxWidth / 2 },
                cp2: { x: width / 2, y: letterBoxWidth / 2 + bezierOffset / 3 },
                p2: { x: width / 2, y: letterBoxWidth / 2 + bezierOffset },
            },
            { x: width / 2, y: height / 2 - letterBoxWidth / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'I',
            center: {
                x: width / 2,
                y: height / 2,
            },
        });
        path = [
            { x: width / 2, y: height / 2 + letterBoxWidth / 2 },
            { x: width / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            {
                cp1: { x: width / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                cp2: { x: width / 2 + bezierOffset / 2, y: height - letterBoxWidth / 2 },
                p2: { x: width / 2 + bezierOffset, y: height - letterBoxWidth / 2 },
            },
            { x: width - letterBoxWidth, y: height - letterBoxWidth / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'Z',
            center: {
                x: width - letterBoxWidth / 2,
                y: height - letterBoxWidth / 2,
            },
        });
    }

    drawVar1(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(ctx, {
            text: 'C',
            center: {
                x: letterBoxWidth / 2,
                y: letterBoxWidth / 2,
            },
        });
        let path: Path = [
            { x: letterBoxWidth / 2, y: letterBoxWidth },
            { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            {
                cp1: { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                cp2: { x: letterBoxWidth / 2 + bezierOffset / 3, y: height - letterBoxWidth / 2 },
                p2: { x: letterBoxWidth / 2 + bezierOffset, y: height - letterBoxWidth / 2 },
            },
            { x: width / 2 - bezierOffset, y: height - letterBoxWidth / 2 },
            {
                cp1: { x: width / 2 - bezierOffset / 3, y: height - letterBoxWidth / 2 },
                cp2: { x: width / 2, y: height - bezierOffset / 3 - letterBoxWidth / 2 },
                p2: { x: width / 2, y: height - bezierOffset - letterBoxWidth / 2 },
            },
            { x: width / 2, y: height / 2 + letterBoxWidth / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'I',
            center: {
                x: width / 2,
                y: height / 2,
            },
        });
        path = [
            { x: width / 2, y: height / 2 - letterBoxWidth / 2 },
            { x: width / 2, y: letterBoxWidth / 2 + bezierOffset },
            {
                cp1: { x: width / 2, y: letterBoxWidth / 2 + bezierOffset / 3 },
                cp2: { x: width / 2 + bezierOffset / 3, y: letterBoxWidth / 2 },
                p2: { x: width / 2 + bezierOffset, y: letterBoxWidth / 2 },
            },
            { x: width - letterBoxWidth / 2 - bezierOffset, y: letterBoxWidth / 2 },
            {
                cp1: { x: width - letterBoxWidth / 2 - bezierOffset / 3, y: letterBoxWidth / 2 },
                cp2: { x: width - letterBoxWidth / 2, y: letterBoxWidth / 2 + bezierOffset / 3 },
                p2: { x: width - letterBoxWidth / 2, y: letterBoxWidth / 2 + bezierOffset },
            },
            { x: width - letterBoxWidth / 2, y: height - letterBoxWidth },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'Z',
            center: {
                x: width - letterBoxWidth / 2,
                y: height - letterBoxWidth / 2,
            },
        });
    }

    drawVar2(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(ctx, {
            text: 'C',
            center: {
                x: letterBoxWidth / 2,
                y: letterBoxWidth / 2,
            },
        });
        let path: Path = [
            { x: letterBoxWidth / 2, y: letterBoxWidth },
            { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            {
                cp1: { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                cp2: { x: letterBoxWidth / 2 + bezierOffset / 3, y: height - letterBoxWidth / 2 },
                p2: { x: letterBoxWidth / 2 + bezierOffset, y: height - letterBoxWidth / 2 },
            },
            { x: width / 2 - letterBoxWidth / 2, y: height - letterBoxWidth / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'I',
            center: {
                x: width / 2,
                y: height - letterBoxWidth / 2,
            },
        });
        path = [
            { x: width / 2 + letterBoxWidth / 2, y: height - letterBoxWidth / 2 },
            { x: width - letterBoxWidth / 2 - bezierOffset, y: height - letterBoxWidth / 2 },
            {
                cp1: { x: width - letterBoxWidth / 2 - bezierOffset / 3, y: height - letterBoxWidth / 2 },
                cp2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                p2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            },
            { x: width - letterBoxWidth / 2, y: height / 2 + letterBoxWidth / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'Z',
            center: {
                x: width - letterBoxWidth / 2,
                y: height / 2,
            },
        });
    }

    drawVar3(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        const mBezierOffset = bezierOffset * 0.75;
        const mLetterBoxWidth = letterBoxWidth * 2 / 3;
        this.drawText(ctx, {
            text: 'C',
            center: {
                x: letterBoxWidth / 2,
                y: height / 2,
            },
        });
        let path: Path = [
            { x: letterBoxWidth, y: height / 2 },
            { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset * 2, y: height / 2 },
            {
                cp1: { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset - mBezierOffset / 3, y: height / 2 },
                cp2: { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset, y: height / 2 + mBezierOffset / 3 },
                p2: { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset, y: height / 2 + mBezierOffset },
            },
            { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset, y: height - letterBoxWidth / 2 - mBezierOffset },
            {
                cp1: { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset, y: height - letterBoxWidth / 2 - mBezierOffset / 3 },
                cp2: { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset / 3, y: height - letterBoxWidth / 2 },
                p2: { x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth, y: height - letterBoxWidth / 2 },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'I',
            center: {
                x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth / 2,
                y: height - letterBoxWidth / 2,
            },
        });
        path = [
            { x: width - letterBoxWidth / 2 - mBezierOffset, y: height - letterBoxWidth / 2 },
            {
                cp1: { x: width - letterBoxWidth / 2 - mBezierOffset / 3, y: height - letterBoxWidth / 2 },
                cp2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - mBezierOffset / 3 },
                p2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - mBezierOffset },
            },
            { x: width - letterBoxWidth / 2, y: letterBoxWidth / 2 + mBezierOffset },
            {
                cp1: { x: width - letterBoxWidth / 2, y: letterBoxWidth / 2 + mBezierOffset / 3 },
                cp2: { x: width - letterBoxWidth / 2 - mBezierOffset / 3, y: letterBoxWidth / 2 },
                p2: { x: width - letterBoxWidth / 2 - mBezierOffset, y: letterBoxWidth / 2 },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'Z',
            center: {
                x: width - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 4,
                y: letterBoxWidth / 2,
            },
        });
    }

    drawVar4(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number,
    ) {
        this.drawText(ctx, {
            text: 'C',
            center: {
                x: width / 2,
                y: letterBoxWidth / 2,
            },
        });
        let mBezierOffset = bezierOffset * 0.8;
        let path: Path = [
            { x: width / 2, y: letterBoxWidth },
            {
                cp1: { x: width / 2, y: letterBoxWidth + mBezierOffset * 2 / 3 },
                cp2: { x: width / 2 - mBezierOffset / 3, y: letterBoxWidth + mBezierOffset },
                p2: { x: width / 2 - mBezierOffset, y: letterBoxWidth + mBezierOffset },
            },
            { x: letterBoxWidth / 2 + mBezierOffset, y: letterBoxWidth + mBezierOffset },
            {
                cp1: { x: letterBoxWidth / 2 + mBezierOffset / 3, y: letterBoxWidth + mBezierOffset },
                cp2: { x: letterBoxWidth / 2, y: letterBoxWidth + mBezierOffset + mBezierOffset / 3 },
                p2: { x: letterBoxWidth / 2, y: letterBoxWidth + mBezierOffset + mBezierOffset },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'I',
            center: {
                x: letterBoxWidth / 2,
                y: height - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 2,
            },
        });
        path = [
            { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            {
                cp1: { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                cp2: { x: letterBoxWidth / 2 + bezierOffset / 3, y: height - letterBoxWidth / 2 },
                p2: { x: letterBoxWidth / 2 + bezierOffset, y: height - letterBoxWidth / 2 },
            },
            { x: width - letterBoxWidth / 2 - bezierOffset, y: height - letterBoxWidth / 2 },
            {
                cp1: { x: width - letterBoxWidth / 2 - bezierOffset / 3, y: height - letterBoxWidth / 2 },
                cp2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                p2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            },
            /*
            { x: width - letterBoxWidth / 2, y: height / 2 + letterBoxWidth / 2 },
            */
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'Z',
            center: {
                x: width - letterBoxWidth / 2,
                y: height - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 2,
            },
        });
    }

    drawVar5(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(ctx, {
            text: 'C',
            center: {
                x: width / 2,
                y: letterBoxWidth / 2,
            },
        });
        let path: Path = [
            { x: width / 2 - letterBoxWidth / 2, y: letterBoxWidth / 2 },
            { x: letterBoxWidth / 2 + bezierOffset, y: letterBoxWidth / 2 },
            {
                cp1: { x: letterBoxWidth / 2 + bezierOffset / 3, y: letterBoxWidth / 2 },
                cp2: { x: letterBoxWidth / 2, y: letterBoxWidth / 2 + bezierOffset / 3 },
                p2: { x: letterBoxWidth / 2, y: letterBoxWidth / 2 + bezierOffset },
            },
            { x: letterBoxWidth / 2, y: height / 2 - bezierOffset },
            {
                cp1: { x: letterBoxWidth / 2, y: height / 2 - bezierOffset / 3 },
                cp2: { x: letterBoxWidth / 2 + bezierOffset / 3, y: height / 2 },
                p2: { x: letterBoxWidth / 2 + bezierOffset, y: height / 2 },
            },
            { x: width / 2 - letterBoxWidth / 2, y: height / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'I',
            center: {
                x: width / 2,
                y: height / 2,
            },
        });
        path = [
            { x: width / 2 + letterBoxWidth / 2, y: height / 2 },
            { x: width - letterBoxWidth / 2 - bezierOffset, y: height / 2 },
            {
                cp1: { x: width - letterBoxWidth / 2 - bezierOffset / 3, y: height / 2 },
                cp2: { x: width - letterBoxWidth / 2, y: height / 2 + bezierOffset / 3 },
                p2: { x: width - letterBoxWidth / 2, y: height / 2 + bezierOffset },
            },
            { x: width - letterBoxWidth / 2, y: height - letterBoxWidth },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'Z',
            center: {
                x: width - letterBoxWidth / 2,
                y: height - letterBoxWidth / 2,
            },
        });
    }

    drawVar6(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number,
    ) {
        this.drawText(ctx, {
            text: 'C',
            center: {
                x: width - letterBoxWidth / 2,
                y: letterBoxWidth / 2,
            },
        });
        let mBezierOffset = bezierOffset * 0.8;
        let path: Path = [
            { x: width - letterBoxWidth / 2, y: letterBoxWidth },
            {
                cp1: { x: width - letterBoxWidth / 2, y: letterBoxWidth + mBezierOffset * 2 / 3 },
                cp2: { x: width - letterBoxWidth / 2 - mBezierOffset * 2 / 3, y: letterBoxWidth + mBezierOffset },
                p2: { x: width - letterBoxWidth / 2 - mBezierOffset, y: letterBoxWidth + mBezierOffset },
            },
            { x: letterBoxWidth / 2 + mBezierOffset, y: letterBoxWidth + mBezierOffset },
            {
                cp1: { x: letterBoxWidth / 2 + mBezierOffset / 3, y: letterBoxWidth + mBezierOffset },
                cp2: { x: letterBoxWidth / 2, y: letterBoxWidth + mBezierOffset + mBezierOffset / 3 },
                p2: { x: letterBoxWidth / 2, y: letterBoxWidth + mBezierOffset + mBezierOffset },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'I',
            center: {
                x: letterBoxWidth / 2,
                y: height - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 2,
            },
        });
        path = [
            { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            {
                cp1: { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                cp2: { x: letterBoxWidth / 2 + bezierOffset / 3, y: height - letterBoxWidth / 2 },
                p2: { x: letterBoxWidth / 2 + bezierOffset, y: height - letterBoxWidth / 2 },
            },
            { x: width - letterBoxWidth, y: height - letterBoxWidth / 2 },
            /*
            {
                cp1: { x: width - letterBoxWidth / 2 - bezierOffset / 3, y: height - letterBoxWidth / 2 },
                cp2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                p2: { x: width - letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            },
            */
            /*
            { x: width - letterBoxWidth / 2, y: height / 2 + letterBoxWidth / 2 },
            */
        ];
        this.drawPath(ctx, path);
        this.drawText(ctx, {
            text: 'Z',
            center: {
                x: width - letterBoxWidth / 2,
                y: height - letterBoxWidth / 2,
            },
        });
    }
}

export { Logo };
