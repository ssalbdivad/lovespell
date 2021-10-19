import { isEmpty, Key } from "@re-do/utils"
import { getScore, getTrie, Letter } from "./dictionary.js"
import { populateFreeSearchGrid } from "./freesearch/populateGrid.js"
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
    [word: string]: { paths: Position[][]; length: number; score: number }
}

export type LetterAnalysis = {
    appearancesOf: LetterAppearances
    grid: Grid<Letter>
    words: Solutions
}

type GenerateGridOptions = {
    rows: number
    columns: number
    mode: Mode
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

export const generateLetterGrid = ({
    rows,
    columns,
    mode,
}: GenerateGridOptions) => {
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
    if (mode === "freesearch") {
        populateFreeSearchGrid(grid)
    } else if (mode === "pangram") {
        populateFreeSearchGrid(grid)
    } else {
        throw new Error(`Unknown mode ${mode}.`)
    }
    const analysis: LetterAnalysis = {
        appearancesOf: adjacentByValue(grid),
        grid,
        words: findWords(grid),
    }
    return analysis
}

export const findWords = (grid: Grid<Letter>): Solutions => {
    const words: Solutions = {}
    const recurse = (prefix: string, node: GridNode, path: Position[]) => {
        Object.entries(node.adjacent).forEach(
            ([position, {get}]) => {
                const adjacentNode = get()
                
                const candidateWord = `${prefix}${adjacentNode.value}`
                const candidateTrie = getTrie(candidateWord)
                if (!candidateTrie || isEmpty(candidateTrie)) {
                    return
                }
                if ("!" in candidateTrie && candidateWord.length >= 3) {
                    if (!words[candidateWord]) {
                        words[candidateWord] = {
                            paths: [],
                            length: candidateWord.length,
                            score: getScore(candidateWord),
                        }
                    }
                    words[candidateWord].paths.push(path)
                }
                recurse(candidateWord, adjacentNode, [...path, position as Position])
            }
        )
    }
    Object.entries(grid).forEach(([position, node]) =>
        recurse(node.value, node , [position as Position])
    )
    return words
}
