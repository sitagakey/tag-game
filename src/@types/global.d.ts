type Position = [number, number];
type MapRange = [number, number];
type ArrayMap = number[][];
type ArrayMapInfo = {
    id: number,
    name: string,
    color: string
};
type Route = {
    position: Position,
    distance: number,
};
type BfsResult = {
    result: boolean,
    routes: Route[],
};
type Direction = 'top' | 'bottom' | 'left' | 'right';
type InitOutput = {
    appCtx: CanvasRenderingContext2D;
    gameController: Controller;
};
type RenderProps = {
    appCtx: CanvasRenderingContext2D;
    player: Character;
    map: Map;
    gameController: Controller;
    mapRange: MapRange;
    createEnemyTimerId: number;
};
type CharacterType = 'player' | 'enemy';