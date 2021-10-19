import { transform } from "@re-do/utils"
import { Letter, letterFrequencies } from "../dictionary.js"
import { Grid, Position } from "../generateGrid.js"
import { randomsFromList } from "../random.js"

const balancedLetterPool = Object.entries(letterFrequencies).reduce(
    (result: string[], [letter, frequency]) => [
        ...result,
        ...letter.repeat(frequency),
    ],
    []
)

export const generateLetters = (count: number) =>
    randomsFromList(balancedLetterPool, count) as Letter[]

export const populateFreeSearchGrid = (emptyGrid: Grid): Grid<Letter> => {
    const gridPositions = Object.keys(emptyGrid) as Position[]
    const randomLetters = generateLetters(gridPositions.length)
    gridPositions.forEach((position, index) => {
        emptyGrid[position].value = randomLetters[index]
    })
    return emptyGrid
}
