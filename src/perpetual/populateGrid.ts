import { generateLetters, Letter } from "../dictionary.js"
import { Grid, Position } from "../generateGrid.js"

export const populatePerpetualGrid = (grid: Grid): Grid<Letter> => {
    const gridPositions = Object.keys(grid) as Position[]
    const randomLetters = generateLetters(gridPositions.length)
    gridPositions.forEach((position, index) => {
        if (!grid[position].value) {
            grid[position].value = randomLetters[index]
        }
    })
    return grid
}
