import { Letter, generateLetters } from "../dictionary.js"
import { Grid, Position } from "../generateGrid.js"

export const populateFreeSearchGrid = (emptyGrid: Grid): Grid<Letter> => {
    const gridPositions = Object.keys(emptyGrid) as Position[]
    const randomLetters = generateLetters(gridPositions.length)
    gridPositions.forEach((position, index) => {
        emptyGrid[position].value = randomLetters[index]
    })
    return emptyGrid
}
