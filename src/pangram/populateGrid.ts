import { randomCommonWordByLength } from "../dictionary.js"
import { Grid, GridAdjacencies, Position } from "../generateGrid.js"
import { randomFromList } from "../random.js"

export const populatePangramGrid = (emptyGrid: Grid) => {
    const word = randomCommonWordByLength(Object.keys(emptyGrid).length, 1000)
    const randomValidPath = (
        adjacencies: Grid | GridAdjacencies,
        remaining: string,
        path: Position[]
    ): Position[] | null => {
        if (!remaining) {
            return path
        }
        const candidatePositions = Object.keys(adjacencies).filter(
            (position) => !path.includes(position as Position)
        ) as Position[]
        let result: Position[] | null = null
        while (candidatePositions.length) {
            const randomCandidatePosition = randomFromList(candidatePositions)
            const candidateNode =
                "get" in adjacencies[randomCandidatePosition]
                    ? (adjacencies[randomCandidatePosition] as any).get()
                    : adjacencies[randomCandidatePosition]
            result = randomValidPath(
                candidateNode.adjacent,
                remaining.slice(1),
                [...path, randomCandidatePosition]
            )
            if (result) {
                return result
            }
            candidatePositions.splice(
                candidatePositions.findIndex(
                    (position) => position === randomCandidatePosition
                )
            )
        }
        return null
    }
    const pangramPath = randomValidPath(emptyGrid, word, [])
    pangramPath?.forEach((position, index) => {
        emptyGrid[position].value = word.at(index)
    })
}
