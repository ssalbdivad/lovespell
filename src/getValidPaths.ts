import { Letter } from "./dictionary.js"
import {
    Position,
    Analysis,
    adjacentByValue,
    maxPositionsUsed,
} from "./generateGrid.js"

export const getValidPaths = (
    input: string,
    { appearancesOf, grid }: Analysis
) => {
    const result = {
        isValid: false,
        lastValidPath: [] as Position[],
        validPaths: [] as Position[][],
    }
    if (!input) {
        return result
    }
    if (!appearancesOf[input[0]]) {
        return result
    }
    result.validPaths = appearancesOf[input[0]].map((position) => [position])
    input
        .substring(1)
        .split("")
        .forEach((char) => {
            const nextValidPaths: Position[][] = []
            result.validPaths.forEach((path) => {
                const nextValidPositions = adjacentByValue(
                    grid[path[path.length - 1]].adjacent
                )[char as Letter]
                if (nextValidPositions) {
                    nextValidPositions.forEach((position) =>
                        nextValidPaths.push([...path, position])
                    )
                }
            })
            if (nextValidPaths.length) {
                // Default to the path that covers the most positions
                result.lastValidPath = maxPositionsUsed(nextValidPaths)
                    .path as Position[]
                result.isValid = true
            } else {
                result.isValid = false
            }
            result.validPaths = nextValidPaths
        })
    return result
}
