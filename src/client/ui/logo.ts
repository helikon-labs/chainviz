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

enum ShapeType {
    Shape0,
    Shape1,
    Shape2,
    Shape3,
    Shape4,
    Shape5,
    Shape6,
}

enum CharacterType {
    Word,
    Letter,
    Dot,
    ASCII,
}

function getRandomShapeType(): ShapeType {
    const random = Math.floor(Math.random() * 7);
    if (random == 0) {
        return ShapeType.Shape0;
    } else if (random == 1) {
        return ShapeType.Shape1;
    } else if (random == 2) {
        return ShapeType.Shape2;
    } else if (random == 3) {
        return ShapeType.Shape3;
    } else if (random == 4) {
        return ShapeType.Shape4;
    } else if (random == 5) {
        return ShapeType.Shape5;
    } else {
        return ShapeType.Shape6;
    }
}

function getRandomCharacterType(): CharacterType {
    const random = Math.floor(Math.random() * 4);
    if (random == 0) {
        return CharacterType.Word;
    } else if (random == 1) {
        return CharacterType.Letter;
    } else if (random == 2) {
        return CharacterType.Dot;
    } else {
        return CharacterType.ASCII;
    }
}

class Logo {
    private readonly shapeType: ShapeType;
    private characterType: CharacterType;
    private readonly logoAnimCanvas: HTMLCanvasElement;
    private readonly logoAnimContext: CanvasRenderingContext2D;

    constructor(shapeType: ShapeType, characterType: CharacterType) {
        this.shapeType = shapeType;
        this.characterType = characterType;
        if (this.characterType == CharacterType.Word) {
            while (this.shapeType != ShapeType.Shape1 && this.shapeType != ShapeType.Shape4) {
                this.shapeType = getRandomShapeType();
            }
        }
        this.logoAnimCanvas = <HTMLCanvasElement>document.getElementById('logo-anim');
        this.logoAnimContext = (<HTMLCanvasElement>document.getElementById('logo-anim')).getContext(
            '2d'
        )!;
    }

    private getCharacter(index: number): string {
        switch (this.characterType) {
            case CharacterType.Word:
                if (index == 0) {
                    return 'CHA';
                } else if (index == 1) {
                    return 'IN';
                } else {
                    return 'VIZ';
                }
            case CharacterType.Letter:
                if (index == 0) {
                    return 'C';
                } else if (index == 1) {
                    return 'I';
                } else {
                    return 'Z';
                }
            case CharacterType.Dot:
                return '•';
            case CharacterType.ASCII:
                if (index == 0) {
                    return '67';
                } else if (index == 1) {
                    return '73';
                } else {
                    return '90';
                }
        }
    }

    async draw() {
        const scale = 1;
        const width = 120 * scale;
        const height = 120 * scale;
        const letterBoxWidth = 28 * scale;
        const bezierOffset = 20 * scale;
        let fontSize = 18 * scale;
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

        const font = new FontFace('Mont', 'url(./font/mont/Mont-Regular.woff)');
        await font.load();
        switch (this.characterType) {
            case CharacterType.ASCII:
                fontSize = 18 * scale * 0.9;
                break;
            case CharacterType.Word:
                fontSize = 18 * scale * 0.75;
                break;
        }
        ctx.font = `${fontSize}px Mont`;
        switch (this.shapeType) {
            case ShapeType.Shape0:
                this.drawVar0(ctx, width, height, letterBoxWidth, bezierOffset);
                break;
            case ShapeType.Shape1:
                this.drawVar1(ctx, width, height, letterBoxWidth, bezierOffset);
                break;
            case ShapeType.Shape2:
                this.drawVar2(ctx, width, height, letterBoxWidth, bezierOffset);
                break;
            case ShapeType.Shape3:
                this.drawVar3(ctx, width, height, letterBoxWidth, bezierOffset);
                break;
            case ShapeType.Shape4:
                this.drawVar4(ctx, width, height, letterBoxWidth, bezierOffset);
                break;
            case ShapeType.Shape5:
                this.drawVar5(ctx, width, height, letterBoxWidth, bezierOffset);
                break;
            case ShapeType.Shape6:
                this.drawVar6(ctx, width, height, letterBoxWidth, bezierOffset);
                break;
        }
    }

    private drawPath(ctx: CanvasRenderingContext2D, path: Path) {
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            const element = path[i];
            if (i == 0) {
                const point = element as Point;
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

    private drawText(ctx: CanvasRenderingContext2D, text: Text, letterBoxWidth: number) {
        if (this.characterType == CharacterType.Dot) {
            ctx.beginPath();
            ctx.arc(text.center.x, text.center.y, letterBoxWidth / 7, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'white';
            ctx.fill();
        } else {
            const tMetrics = ctx.measureText(text.text);
            const tW = tMetrics.width;
            const tH = tMetrics.actualBoundingBoxAscent + tMetrics.actualBoundingBoxDescent;
            ctx.fillText(text.text, text.center.x - tW / 2, text.center.y - tH / 2);
        }
    }

    private drawVar0(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(
            ctx,
            {
                text: 'C',
                center: {
                    x: letterBoxWidth / 2,
                    y: letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
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
        this.drawText(
            ctx,
            {
                text: 'I',
                center: {
                    x: width / 2,
                    y: height / 2,
                },
            },
            letterBoxWidth
        );
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
        this.drawText(
            ctx,
            {
                text: 'Z',
                center: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
    }

    private drawVar1(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(
            ctx,
            {
                text: this.getCharacter(0),
                center: {
                    x: letterBoxWidth / 2,
                    y: letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
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
        this.drawText(
            ctx,
            {
                text: this.getCharacter(1),
                center: {
                    x: width / 2,
                    y: height / 2,
                },
            },
            letterBoxWidth
        );
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
        this.drawText(
            ctx,
            {
                text: this.getCharacter(2),
                center: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
    }

    private drawVar2(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(
            ctx,
            {
                text: this.getCharacter(0),
                center: {
                    x: letterBoxWidth / 2,
                    y: letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
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
        this.drawText(
            ctx,
            {
                text: this.getCharacter(1),
                center: {
                    x: width / 2,
                    y: height - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
        path = [
            { x: width / 2 + letterBoxWidth / 2, y: height - letterBoxWidth / 2 },
            { x: width - letterBoxWidth / 2 - bezierOffset, y: height - letterBoxWidth / 2 },
            {
                cp1: {
                    x: width - letterBoxWidth / 2 - bezierOffset / 3,
                    y: height - letterBoxWidth / 2,
                },
                cp2: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - bezierOffset / 3,
                },
                p2: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - bezierOffset,
                },
            },
            { x: width - letterBoxWidth / 2, y: height / 2 + letterBoxWidth / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(
            ctx,
            {
                text: this.getCharacter(2),
                center: {
                    x: width - letterBoxWidth / 2,
                    y: height / 2,
                },
            },
            letterBoxWidth
        );
    }

    private drawVar3(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        const mBezierOffset = bezierOffset * 0.75;
        this.drawText(
            ctx,
            {
                text: this.getCharacter(0),
                center: {
                    x: letterBoxWidth / 2,
                    y: height / 2,
                },
            },
            letterBoxWidth
        );
        let path: Path = [
            { x: letterBoxWidth, y: height / 2 },
            {
                x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset * 2,
                y: height / 2,
            },
            {
                cp1: {
                    x:
                        width -
                        letterBoxWidth / 2 -
                        mBezierOffset -
                        letterBoxWidth -
                        mBezierOffset -
                        mBezierOffset / 3,
                    y: height / 2,
                },
                cp2: {
                    x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset,
                    y: height / 2 + mBezierOffset / 3,
                },
                p2: {
                    x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset,
                    y: height / 2 + mBezierOffset,
                },
            },
            {
                x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset,
                y: height - letterBoxWidth / 2 - mBezierOffset,
            },
            {
                cp1: {
                    x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth - mBezierOffset,
                    y: height - letterBoxWidth / 2 - mBezierOffset / 3,
                },
                cp2: {
                    x:
                        width -
                        letterBoxWidth / 2 -
                        mBezierOffset -
                        letterBoxWidth -
                        mBezierOffset / 3,
                    y: height - letterBoxWidth / 2,
                },
                p2: {
                    x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth,
                    y: height - letterBoxWidth / 2,
                },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(
            ctx,
            {
                text: this.getCharacter(1),
                center: {
                    x: width - letterBoxWidth / 2 - mBezierOffset - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
        path = [
            { x: width - letterBoxWidth / 2 - mBezierOffset, y: height - letterBoxWidth / 2 },
            {
                cp1: {
                    x: width - letterBoxWidth / 2 - mBezierOffset / 3,
                    y: height - letterBoxWidth / 2,
                },
                cp2: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - mBezierOffset / 3,
                },
                p2: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - mBezierOffset,
                },
            },
            { x: width - letterBoxWidth / 2, y: letterBoxWidth / 2 + mBezierOffset },
            {
                cp1: { x: width - letterBoxWidth / 2, y: letterBoxWidth / 2 + mBezierOffset / 3 },
                cp2: { x: width - letterBoxWidth / 2 - mBezierOffset / 3, y: letterBoxWidth / 2 },
                p2: { x: width - letterBoxWidth / 2 - mBezierOffset, y: letterBoxWidth / 2 },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(
            ctx,
            {
                text: this.getCharacter(2),
                center: {
                    x: width - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 4,
                    y: letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
    }

    private drawVar4(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(
            ctx,
            {
                text: this.getCharacter(0),
                center: {
                    x: width / 2,
                    y: letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
        const mBezierOffset = bezierOffset * 0.8;
        let path: Path = [
            { x: width / 2, y: letterBoxWidth },
            {
                cp1: { x: width / 2, y: letterBoxWidth + (mBezierOffset * 2) / 3 },
                cp2: { x: width / 2 - mBezierOffset / 3, y: letterBoxWidth + mBezierOffset },
                p2: { x: width / 2 - mBezierOffset, y: letterBoxWidth + mBezierOffset },
            },
            { x: letterBoxWidth / 2 + mBezierOffset, y: letterBoxWidth + mBezierOffset },
            {
                cp1: {
                    x: letterBoxWidth / 2 + mBezierOffset / 3,
                    y: letterBoxWidth + mBezierOffset,
                },
                cp2: {
                    x: letterBoxWidth / 2,
                    y: letterBoxWidth + mBezierOffset + mBezierOffset / 3,
                },
                p2: { x: letterBoxWidth / 2, y: letterBoxWidth + mBezierOffset + mBezierOffset },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(
            ctx,
            {
                text: this.getCharacter(1),
                center: {
                    x: letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
        path = [
            { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            {
                cp1: { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                cp2: { x: letterBoxWidth / 2 + bezierOffset / 3, y: height - letterBoxWidth / 2 },
                p2: { x: letterBoxWidth / 2 + bezierOffset, y: height - letterBoxWidth / 2 },
            },
            { x: width - letterBoxWidth / 2 - bezierOffset, y: height - letterBoxWidth / 2 },
            {
                cp1: {
                    x: width - letterBoxWidth / 2 - bezierOffset / 3,
                    y: height - letterBoxWidth / 2,
                },
                cp2: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - bezierOffset / 3,
                },
                p2: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - bezierOffset,
                },
            },
            /*
            { x: width - letterBoxWidth / 2, y: height / 2 + letterBoxWidth / 2 },
            */
        ];
        this.drawPath(ctx, path);
        this.drawText(
            ctx,
            {
                text: this.getCharacter(2),
                center: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
    }

    private drawVar5(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(
            ctx,
            {
                text: this.getCharacter(0),
                center: {
                    x: width / 2,
                    y: letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
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
        this.drawText(
            ctx,
            {
                text: this.getCharacter(1),
                center: {
                    x: width / 2,
                    y: height / 2,
                },
            },
            letterBoxWidth
        );
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
        this.drawText(
            ctx,
            {
                text: this.getCharacter(2),
                center: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
    }

    private drawVar6(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        letterBoxWidth: number,
        bezierOffset: number
    ) {
        this.drawText(
            ctx,
            {
                text: this.getCharacter(0),
                center: {
                    x: width - letterBoxWidth / 2,
                    y: letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
        const mBezierOffset = bezierOffset * 0.8;
        let path: Path = [
            { x: width - letterBoxWidth / 2, y: letterBoxWidth },
            {
                cp1: { x: width - letterBoxWidth / 2, y: letterBoxWidth + (mBezierOffset * 2) / 3 },
                cp2: {
                    x: width - letterBoxWidth / 2 - (mBezierOffset * 2) / 3,
                    y: letterBoxWidth + mBezierOffset,
                },
                p2: {
                    x: width - letterBoxWidth / 2 - mBezierOffset,
                    y: letterBoxWidth + mBezierOffset,
                },
            },
            { x: letterBoxWidth / 2 + mBezierOffset, y: letterBoxWidth + mBezierOffset },
            {
                cp1: {
                    x: letterBoxWidth / 2 + mBezierOffset / 3,
                    y: letterBoxWidth + mBezierOffset,
                },
                cp2: {
                    x: letterBoxWidth / 2,
                    y: letterBoxWidth + mBezierOffset + mBezierOffset / 3,
                },
                p2: { x: letterBoxWidth / 2, y: letterBoxWidth + mBezierOffset + mBezierOffset },
            },
        ];
        this.drawPath(ctx, path);
        this.drawText(
            ctx,
            {
                text: this.getCharacter(1),
                center: {
                    x: letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2 - bezierOffset - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
        path = [
            { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset },
            {
                cp1: { x: letterBoxWidth / 2, y: height - letterBoxWidth / 2 - bezierOffset / 3 },
                cp2: { x: letterBoxWidth / 2 + bezierOffset / 3, y: height - letterBoxWidth / 2 },
                p2: { x: letterBoxWidth / 2 + bezierOffset, y: height - letterBoxWidth / 2 },
            },
            { x: width - letterBoxWidth, y: height - letterBoxWidth / 2 },
        ];
        this.drawPath(ctx, path);
        this.drawText(
            ctx,
            {
                text: this.getCharacter(2),
                center: {
                    x: width - letterBoxWidth / 2,
                    y: height - letterBoxWidth / 2,
                },
            },
            letterBoxWidth
        );
    }
}

export { Logo, getRandomShapeType, getRandomCharacterType };
