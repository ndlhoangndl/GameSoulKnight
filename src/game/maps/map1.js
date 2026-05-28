export const MAP_1_WIDTH = 16;
export const MAP_1_HEIGHT = 16;

// 0 = wall, 1 = floor, 2 = door
export function createMap1Tiles() {
    const width = MAP_1_WIDTH;
    const height = MAP_1_HEIGHT;
    const tiles = new Array(width * height).fill(1);

    // Border walls
    for (let c = 0; c < width; c++) {
        tiles[c] = 0;
        tiles[(height - 1) * width + c] = 0;
    }
    for (let r = 0; r < height; r++) {
        tiles[r * width] = 0;
        tiles[r * width + (width - 1)] = 0;
    }

    // 4 doors: top, right, bottom, left
    tiles[0 * width + 8] = 2;
    tiles[8 * width + (width - 1)] = 2;
    tiles[(height - 1) * width + 8] = 2;
    tiles[8 * width + 0] = 2;

    return tiles;
}

export const MAP_1_TILES = createMap1Tiles();

