export type Point = { x: number; y: number };

export class Bezier {
    public static createBezierCurvePoints(
        pointsArray: Point[],
        smoothValue: number
    ) {
        let controlPoints = this.createBezierCurveControl(
            pointsArray,
            smoothValue
        );
        let bezierCurvePoints = [];
        for (let i = 0; i < pointsArray.length - 1; i++) {
            for (let j = 0; j <= 100; j++) {
                bezierCurvePoints.push(
                    this.createBezierCurve(
                        pointsArray[i],
                        pointsArray[i + 1],
                        controlPoints[2 * i],
                        controlPoints[2 * i + 1],
                        j / 100
                    )
                );
            }
        }
        return bezierCurvePoints;
    }

    protected static createBezierCurve(
        startPoint: Point,
        endPoint: Point,
        controlPoint1: Point,
        controlPoint2: Point,
        t: number
    ) {
        let x =
            Math.pow(1 - t, 3) * startPoint.x +
            3 * controlPoint1.x * t * Math.pow(1 - t, 2) +
            3 * controlPoint2.x * t * t * (1 - t) +
            endPoint.x * t * t * t;
        let y =
            Math.pow(1 - t, 3) * startPoint.y +
            3 * controlPoint1.y * t * Math.pow(1 - t, 2) +
            3 * controlPoint2.y * t * t * (1 - t) +
            endPoint.y * t * t * t;
        return { x, y };
    }

    protected static createBezierCurveControl(
        pointsArr: Point[],
        smooth_value: number
    ) {
        let points = [...pointsArr];
        points.unshift({ x: points[0].x - 50, y: points[0].y + 50 });
        points.push({
            x: points[points.length - 1].x + 50,
            y: points[points.length - 1].y + 50,
        });
        let controlPoints = [];
        for (let i = 0, len = points.length - 3; i < len; i++) {
            let x0 = points[i].x,
                y0 = points[i].y;
            let x1 = points[i + 1].x,
                y1 = points[i + 1].y;
            let x2 = points[i + 2].x,
                y2 = points[i + 2].y;
            let x3 = points[i + 3].x,
                y3 = points[i + 3].y;
            let xc1 = (x0 + x1) / 2.0;
            let yc1 = (y0 + y1) / 2.0;
            let xc2 = (x1 + x2) / 2.0;
            let yc2 = (y1 + y2) / 2.0;
            let xc3 = (x2 + x3) / 2.0;
            let yc3 = (y2 + y3) / 2.0;
            let len1 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            let len2 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            let len3 = Math.sqrt((x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2));
            let k1 = len1 / (len1 + len2);
            let k2 = len2 / (len2 + len3);
            let xm1 = xc1 + (xc2 - xc1) * k1;
            let ym1 = yc1 + (yc2 - yc1) * k1;
            let xm2 = xc2 + (xc3 - xc2) * k2;
            let ym2 = yc2 + (yc3 - yc2) * k2;
            let ctrl1_x = Math.round(
                xm1 + (xc2 - xm1) * smooth_value + x1 - xm1
            );
            let ctrl1_y = Math.round(
                ym1 + (yc2 - ym1) * smooth_value + y1 - ym1
            );

            let ctrl2_x = Math.round(
                xm2 + (xc2 - xm2) * smooth_value + x2 - xm2
            );
            let ctrl2_y = Math.round(
                ym2 + (yc2 - ym2) * smooth_value + y2 - ym2
            );
            controlPoints.push(
                { x: ctrl1_x, y: ctrl1_y },
                { x: ctrl2_x, y: ctrl2_y }
            );
        }
        return controlPoints;
    }
}
