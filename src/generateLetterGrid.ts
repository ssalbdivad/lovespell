import { isEmpty } from "@re-do/utils"
import { getScore, getTrie, letterFrequencies } from "./dictionary.js"

type GenerateLetterGridOptions = {
    rows: number
    columns: number
}

const balancedLetterPool = Object.entries(letterFrequencies).reduce(
    (result: string[], [letter, frequency]) => [
        ...result,
        ...letter.repeat(frequency),
    ],
    []
)

export const randomInRange = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

export const randomFromList = <T>(list: T[]) =>
    list[randomInRange(0, list.length - 1)]

export const randomsFromList = <T>(list: T[], count: number) =>
    [...Array(count)].map((_) => randomFromList(list))

export const generateLetters = (count: number) =>
    randomsFromList(balancedLetterPool, count)

export type LetterPosition<
    x extends string = string,
    y extends string = string
> = `${x},${y}`

export type LetterAdjacencies = {
    [letterPosition: LetterPosition]: {
        letter: string
        adjacent: LetterPositions
    }
}

export type LetterPositions = { [letter: string]: LetterPosition[] }

export type Solutions = {
    [word: string]: { paths: LetterPosition[][]; length: number; score: number }
}

export type LetterAnalysis = {
    grid: string[][]
    positions: LetterPositions
    adjacencies: LetterAdjacencies
    words: Solutions
}

export const generateLetterGrid = ({
    rows,
    columns,
}: GenerateLetterGridOptions): LetterAnalysis => {
    const randomLetters = generateLetters(rows * columns)
    const grid = [...Array(rows)].map((_, rowIndex) =>
        [...Array(columns)].map(
            (_, columnIndex) => randomLetters[rowIndex * columns + columnIndex]
        )
    )
    const analysis: LetterAnalysis = {
        grid: grid,
        positions: {},
        adjacencies: {},
        words: {},
    }
    grid.forEach((row, rowIndex) =>
        row.forEach((letter, columnIndex) => {
            const adjacentRows = [rowIndex - 1, rowIndex, rowIndex + 1]
            const adjacentColumns = [
                columnIndex - 1,
                columnIndex,
                columnIndex + 1,
            ]
            const adjacent = adjacentRows.reduce<LetterPositions>(
                (adjacencies, rowToCheck) => {
                    if (rowToCheck < 0 || rowToCheck >= grid.length) {
                        return adjacencies
                    }
                    return adjacentColumns.reduce(
                        (updatedAdjacencies, columnToCheck) => {
                            if (
                                columnToCheck < 0 ||
                                columnToCheck >= row.length ||
                                (rowToCheck === rowIndex &&
                                    columnToCheck === columnIndex)
                            ) {
                                return updatedAdjacencies
                            }
                            const letterToCheck =
                                grid[rowToCheck][columnToCheck]
                            const existingAdjacencies =
                                updatedAdjacencies[letterToCheck] ?? []
                            return {
                                ...updatedAdjacencies,
                                [letterToCheck]: [
                                    ...existingAdjacencies,
                                    `${rowToCheck},${columnToCheck}`,
                                ],
                            }
                        },
                        adjacencies
                    )
                },
                {}
            )
            analysis.adjacencies[`${rowIndex},${columnIndex}`] = {
                letter,
                adjacent,
            }
            const existingLetterPositions = analysis.positions[letter] ?? []
            analysis.positions[letter] = [
                ...existingLetterPositions,
                `${rowIndex},${columnIndex}`,
            ]
        })
    )
    analysis.words = findWords(analysis)
    return analysis
}

export const findWords = (analysis: LetterAnalysis): Solutions => {
    const words: Solutions = {}
    const recurse = (prefix: string, path: LetterPosition[]) => {
        const lastPosition = path[path.length - 1]
        Object.entries(analysis.adjacencies[lastPosition].adjacent).forEach(
            ([letter, positions]) => {
                const candidateWord = `${prefix}${letter}`
                const candidateTrie = getTrie(candidateWord)
                if (!candidateTrie || isEmpty(candidateTrie)) {
                    return
                }
                if ("!" in candidateTrie) {
                    if (!words[candidateWord]) {
                        words[candidateWord] = {
                            paths: [],
                            length: candidateWord.length,
                            score: getScore(candidateWord),
                        }
                    }
                    words[candidateWord].paths.push(path)
                }
                positions.forEach((position) =>
                    recurse(candidateWord, [...path, position])
                )
            }
        )
    }
    Object.entries(analysis.adjacencies).forEach(([position, { letter }]) =>
        recurse(letter, [position as LetterPosition])
    )
    return words
}
