import { isEmpty, Key } from "@re-do/utils"
import { getScore, getTrie, Letter } from "./dictionary.js"
import { populateFreeSearchGrid } from "./freesearch/populateGrid.js"
import { populatePangramGrid } from "./pangram/populateGrid.js"
import { populatePerpetualGrid } from "./perpetual/populateGrid.js"
import { Mode } from "./state.js"

export type Position<
    x extends string = string,
    y extends string = string
> = `${x},${y}`

export type Grid<T = any> = {
    [position: Position]: GridNode<T>
}

export type GridAdjacencies<T = any> = {
    [position: Position]: {
        get: () => GridNode<T>
    }
}

export type GridNode<T = any> = {
    value: T
    adjacent: GridAdjacencies<T>
}

export type AdjacentByValue<T extends Key> = {
    [K in T]: Position[]
}

export type LetterAppearances = { [letter: string]: Position[] }

export type Solutions = {
    [word: string]: {
        paths: Position[][]
        length: number
        score: number
        positionsUsed: number
    }
}

export type Analysis = {
    appearancesOf: LetterAppearances
    grid: Grid<Letter>
    solutions: Solutions
}

type FillGridOptions = {
    grid: Grid<any>
    mode: Mode
}

export const gridDimensionsByMode: {
    [K in Mode]: {
        min: number
        max: number
        default: number
    }
} = {
    pangram: {
        min: 2,
        default: 3,
        max: 4,
    },
    freesearch: {
        min: 2,
        default: 3,
        max: 7,
    },
    perpetual: {
        min: 2,
        default: 3,
        max: 7,
    },
}
export const adjacentByValue = <T extends Key>(
    node: GridAdjacencies<T> | Grid<T>
) =>
    Object.entries(node).reduce((result, [position, node]) => {
        const value: T = "get" in node ? node.get().value : node.value
        const previousPositions = result[value] ?? []
        return {
            ...result,
            [value]: [...previousPositions, position],
        } as AdjacentByValue<T>
    }, {} as AdjacentByValue<T>)

export type GenerateEmptyGridOptions = {
    rows: number
    columns: number
}

export const generateEmptyGrid = ({
    rows,
    columns,
}: GenerateEmptyGridOptions) => {
    const grid: Grid = {}
    ;[...Array(rows)].forEach((_, rowIndex) => {
        const adjacentRows = [rowIndex - 1, rowIndex, rowIndex + 1].filter(
            (_) => _ >= 0 && _ < rows
        )
        ;[...Array(columns)].forEach((_, columnIndex) => {
            const adjacentColumns = [
                columnIndex - 1,
                columnIndex,
                columnIndex + 1,
            ].filter((_) => _ >= 0 && _ < columns)
            const adjacent: GridAdjacencies = {}
            adjacentRows.forEach((adjacentRowIndex) =>
                adjacentColumns.forEach((adjacentColumnIndex) => {
                    if (
                        adjacentRowIndex === rowIndex &&
                        adjacentColumnIndex === columnIndex
                    ) {
                        return
                    }
                    adjacent[`${adjacentRowIndex},${adjacentColumnIndex}`] = {
                        get: () =>
                            grid[`${adjacentRowIndex},${adjacentColumnIndex}`],
                    }
                })
            )
            grid[`${rowIndex},${columnIndex}`] = {
                value: undefined,
                adjacent,
            }
        })
    })
    return grid
}

export type GenerateLetterGridOptions = Omit<
    FillGridOptions & GenerateEmptyGridOptions,
    "grid"
>

export const generateLetterGrid = ({
    rows,
    columns,
    mode,
}: GenerateLetterGridOptions) => {
    const grid = generateEmptyGrid({ rows, columns })
    return fillLetterGrid({ grid, mode })
}

export const fillLetterGrid = ({ grid, mode }: FillGridOptions) => {
    let attemptsRemaining = 5
    let solutions: Solutions = {}
    while (isEmpty(solutions)) {
        if (attemptsRemaining === 0) {
            throw new Error(
                `Unable to generate a valid ${mode} grid of length ${
                    Object.keys(grid).length
                }.`
            )
        }
        if (mode === "freesearch") {
            populateFreeSearchGrid(grid)
            solutions = findWords(grid)
        } else if (mode === "pangram") {
            const { word, path } = populatePangramGrid(grid)
            solutions = {
                [word]: {
                    paths: [path],
                    length: word.length,
                    score: getScore(word),
                    positionsUsed: path.length,
                },
            }
        } else if (mode === "perpetual") {
            populatePerpetualGrid(grid)
            solutions = findWords(grid)
            if (Object.keys(solutions).length < 10) {
                populateFreeSearchGrid(grid)
                solutions = findWords(grid)
            }
        } else {
            throw new Error(`Unknown mode ${mode}.`)
        }
        attemptsRemaining--
    }
    const analysis: Analysis = {
        appearancesOf: adjacentByValue(grid),
        grid,
        solutions,
    }
    return analysis
}

export const pathToWord = (path: Position[], analysis: Analysis) =>
    path.map((position) => analysis.grid[position].value).join("")

export const maxPositionsUsed = (paths: string[][]) => {
    let maxPositionsUsed = 0
    let maxPath: string[] = []
    paths.forEach((path) => {
        const positionsSeen = path.reduce(
            (seen, position) =>
                position in seen ? seen : { ...seen, [position]: true },
            {} as Record<Position, boolean>
        )
        const positionsUsed = Object.keys(positionsSeen).length
        if (positionsUsed > maxPositionsUsed) {
            maxPositionsUsed = positionsUsed
            maxPath = path
        }
    })
    return {
        path: maxPath,
        count: maxPositionsUsed,
    }
}

export const findWords = (grid: Grid<Letter>): Solutions => {
    const words: Solutions = {}
    const recurse = (prefix: string, node: GridNode, path: Position[]) => {
        Object.entries(node.adjacent).forEach(([position, { get }]) => {
            const adjacentNode = get()
            const candidateWord = `${prefix}${adjacentNode.value}`
            const candidateTrie = getTrie(candidateWord)
            const candidatePath = [...path, position as Position]
            if (!candidateTrie || isEmpty(candidateTrie)) {
                return
            }
            if ("!" in candidateTrie && candidateWord.length >= 3) {
                if (!words[candidateWord]) {
                    words[candidateWord] = {
                        paths: [],
                        length: candidateWord.length,
                        score: getScore(candidateWord),
                        // Will populate this once we have all the paths
                        positionsUsed: 0,
                    }
                }
                words[candidateWord].paths.push(candidatePath)
            }
            recurse(candidateWord, adjacentNode, candidatePath)
        })
    }
    Object.entries(grid).forEach(([position, node]) =>
        recurse(node.value, node, [position as Position])
    )
    Object.entries(words).forEach(
        ([word, data]) =>
            (words[word] = {
                ...data,
                positionsUsed: maxPositionsUsed(data.paths).count,
            })
    )
    return words
}
