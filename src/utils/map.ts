import { HAVE_BEEN_TO } from '@/constants/map';
export class GameMap {
    array: number[][];
    cellSize: number;
    info: ArrayMapInfo[];
    range: MapRange;

    constructor(arrayMap: number[][], cellSize: number, info: ArrayMapInfo[], range: MapRange) {
        this.array = JSON.parse(JSON.stringify(arrayMap));
        this.cellSize = cellSize;
        this.info = info;
        this.range = range;
    }

    getInfo(id: number): ArrayMapInfo {
        const result = this.info.find((item) => item.id === id);

        if (!result) {
            throw new Error(`Do not exist ArrayMapInfo associated with "${id}"`);
        }

        return result;
    }
    getArrayMapIdUsingPosition(position: Position): number {
        const [y, x] = position;

        if (typeof this.array[y] !== 'undefined' && typeof this.array[y][x] === 'number') {
            const id = this.array[y][x];

            return id;
        } else {
            return -1;
        }
    }
    createEdge(direction: Direction) {
        if (direction === 'top') {
            const newEdge = Array(this.array[0].length).fill(0);
            this.array.unshift(newEdge);
        } else if (direction === 'right') {
            for (let i = this.array.length; i--;) {
                this.array[i].push(0);
            }
        } else if (direction === 'bottom') {
            const newEdge = Array(this.array[this.array.length - 1].length).fill(0);
            this.array.push(newEdge);
        } else if (direction === 'left') {
            for (let i = this.array.length; i--;) {
                this.array[i].unshift(0);
            }
        }
    }
    render(appCtx: CanvasRenderingContext2D , arrayMap: number[][]) {
        for (let y = 0, yLen = arrayMap.length; y < yLen; y++) {
            const horizontalArray = arrayMap[y];
            for (let x = 0, xLen = horizontalArray.length; x < xLen; x++) {
                const id = arrayMap[y][x];
                const info = this.getInfo(id);

                appCtx.fillStyle = info?.color ?? '#BCAAA4';
                appCtx.strokeStyle = '#BCAAA4';
                appCtx.fillRect(this.cellSize * x, this.cellSize * y, this.cellSize, this.cellSize);
                appCtx.strokeRect(this.cellSize * x, this.cellSize * y, this.cellSize, this.cellSize);
            }
        }
    }
    static containsId(arrayMap: ArrayMap, position: Position, idList: number[]) {
        const [y, x] = position;
        const existId = typeof arrayMap[y] !== 'undefined'　&& typeof arrayMap[y][x] === 'number';
        if (existId) {
            const id = arrayMap[y][x];

            return idList.includes(id);
        }

        return false;
    }
    static isAdjacent(basePosition: Position, comparisonTargetPosition: Position) {
        const [basePositionY, basePositionX] = basePosition;
        const [comparisonTargetPositionY, comparisonTargetPositionX] = comparisonTargetPosition;
        const isAdjacentToTop = basePositionY + 1 === comparisonTargetPositionY && basePositionX === comparisonTargetPositionX;
        const isAdjacentToRight = basePositionY === comparisonTargetPositionY && basePositionX + 1 === comparisonTargetPositionX;
        const isAdjacentToBottom = basePositionY === comparisonTargetPositionY && basePositionX - 1 === comparisonTargetPositionX;
        const isAdjacentToLeft = basePositionY - 1 === comparisonTargetPositionY && basePositionX === comparisonTargetPositionX;

        if (
            isAdjacentToTop ||
            isAdjacentToRight ||
            isAdjacentToBottom ||
            isAdjacentToLeft
        ) {
            return true;
        }

        return false;
    };
    /**
     * arrayMapを部分的に切り取る
     */
    cutArrayMap(basePos: Position) {
        const [basePosY, basePosX] = basePos;
        const [rangeY, rangeX] = this.range;
        const result = new Array(rangeY * 2 + 1).fill(null).map((item, i) => {
            return Array(rangeX * 2 + 1).fill(0);
        });

        for (let y = basePosY - rangeY, i = 0; y <= basePosY + rangeY; y++, i++) {
            if (y < 0 || y >= this.array.length) {
                continue;
            }
            for (let x = basePosX - rangeX, j = 0; x <= basePosX + rangeX; x++, j++) {
                if (x < 0 || x >= this.array[y].length) {
                    continue;
                }

                result[i][j] = this.array[y][x];
            }
        }

        return result;
    }
    static getAllRoutes(arrayMap: ArrayMap, startPosition: Position, [endPositionY, endPositionX]: Position, safeId: number[]) {
        const containsQueue = (queue: Route[], position: Position): boolean => {
            return queue.some((route) => {
                return route.position[0] === position[0] && route.position[1] === position[1];
            });
        };
        const search = (route: Route, queue: Route[] = [], routes: Route[] = []): BfsResult => {
            routes.push(route);

            const [currentPosY, currentPosX] = route.position;
            const distance = route.distance;
            const isEnd = currentPosY === endPositionY && currentPosX === endPositionX;
            if (isEnd) {
                return {
                    result: true,
                    routes,
                };
            }

            arrayMapClone[currentPosY][currentPosX] = HAVE_BEEN_TO;

            const topPosition: Position = [currentPosY - 1, currentPosX];
            const rightPosition: Position = [currentPosY, currentPosX + 1];
            const bottomPosition: Position = [currentPosY + 1, currentPosX];
            const leftPosition: Position = [currentPosY, currentPosX - 1];
            if (GameMap.containsId(arrayMapClone, topPosition, safeId) && !containsQueue(queue, topPosition)) {
                const topRoute: Route = {position: topPosition, distance: distance + 1};
                queue.push(topRoute);
            }
            if (GameMap.containsId(arrayMapClone, rightPosition, safeId) && !containsQueue(queue, rightPosition)) {
                const rightRoute: Route = {position: rightPosition, distance: distance + 1};
                queue.push(rightRoute);
            }
            if (GameMap.containsId(arrayMapClone, bottomPosition, safeId) && !containsQueue(queue, bottomPosition)) {
                const bottomRoute: Route = {position: bottomPosition, distance: distance + 1};
                queue.push(bottomRoute);
            }
            if (GameMap.containsId(arrayMapClone, leftPosition, safeId) && !containsQueue(queue, leftPosition)) {
                const leftRoute: Route = {position: leftPosition, distance: distance + 1};
                queue.push(leftRoute);
            }

            const existQueue = queue.length > 0;
            if (existQueue) {
                const nextPos = queue[0];
                const remainQueue = queue.slice(1, queue.length);
                
                return search(nextPos, remainQueue, routes);
            } else {
                return {
                    result: false,
                    routes,
                };
            }
        };
        const arrayMapClone = JSON.parse(JSON.stringify(arrayMap));

        return search({
            position: startPosition,
            distance: 0,
        });
    }
    static getRoutesToGo(routes: Route[]) {
        const move = (currentIndex: number, acc: Route[] = []): Route[] => {
            const currentRoute = routes[currentIndex];
            acc.unshift(currentRoute);

            for (let i = currentIndex; i--;) {
                const nextRoutes = routes[i];
                if (GameMap.isAdjacent(currentRoute.position, nextRoutes.position)) {
                    return move(i, acc);
                }
            }

            return acc;
        };

        return move(routes.length - 1);
    }
}
