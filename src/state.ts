import {
    fillLetterGrid,
    Analysis,
    Position,
    gridDimensionsByMode,
    maxPositionsUsed,
    generateLetterGrid,
} from "./generateGrid"
import { Store } from "react-statelessly"
import { getScore, isWord } from "./dictionary.js"
import { transform, withDefaults } from "@re-do/utils"

export const isMobile = window.innerWidth <= 800

export type Mode = "pangram" | "freesearch" | "perpetual"

export type GetDefaultStateArgs = {
    mode?: Mode
    rows?: number
    columns?: number
    pangramsFound?: number
}

export const getDefaultState = (args: GetDefaultStateArgs = {}) => {
    const { mode, rows, columns, pangramsFound } =
        withDefaults<GetDefaultStateArgs>({
            mode: "pangram",
            rows: 3,
            columns: 3,
            pangramsFound: 0,
        })(args)
    return {
        analysis: [
            generateLetterGrid({
                rows,
                columns,
                mode,
            }),
        ],
        score: 0,
        wordsFound: [] as string[],
        path: [] as Position[],
        input: "",
        error: "",
        hintPath: [] as Position[],
        isValid: true,
        revealed: false,
        rows,
        columns,
        mode,
        pangramsFound,
        lastGameStart: 0,
        gameOver: false,
    }
}

export type LoveSpellState = ReturnType<typeof getDefaultState>

export const store = new Store(
    getDefaultState(),
    {
        refreshGrid: (args, store) => {
            const { rows, columns, mode, pangramsFound } = store.query({
                rows: true,
                columns: true,
                mode: true,
                pangramsFound: true,
            })
            return getDefaultState({ rows, columns, mode, pangramsFound })
        },
        submitInput: (args, store) => {
            const {
                isValid,
                input,
                wordsFound,
                mode,
                path,
                analysis,
                lastGameStart,
                gameOver,
            } = store.query({
                wordsFound: true,
                isValid: true,
                input: true,
                mode: true,
                path: true,
                analysis: true,
                lastGameStart: true,
                gameOver: true,
            })
            if (gameOver) {
                return {
                    error: "You can't spell any more words until you start a new game.",
                }
            }
            if (!isValid) {
                return { error: "You can't spell that!" }
            }
            if (!input) {
                return { error: "" }
            } else if (input.length < 3) {
                return { error: "3+ letters. I believe in you." }
            } else if (!isWord(input)) {
                return { error: "I don't think that's a word..." }
            } else {
                if (mode === "freesearch") {
                    if (wordsFound.includes(input)) {
                        return { error: "You already found that!" }
                    }
                    return {
                        wordsFound: (_) => [..._, input],
                        score: (_) => _ + getScore(input),
                        path: [],
                        error: "",
                        isValid: true,
                        input: "",
                    }
                } else if (mode === "pangram") {
                    const positionsUsed = maxPositionsUsed([path]).count
                    const gridPositions = Object.keys(analysis[0].grid).length
                    if (positionsUsed < gridPositions) {
                        return {
                            error: `You missed ${
                                gridPositions - positionsUsed
                            } squares! Try paying them a visit.`,
                        }
                    }
                    store.update({ pangramsFound: (_) => _ + 1 })
                    store.actions.refreshGrid()
                } else if (mode === "perpetual") {
                    path.forEach((position) => {
                        analysis[0].grid[position].value = undefined as any
                    })
                    return {
                        score: (_) => _ + getScore(input),
                        path: [],
                        error: "",
                        isValid: true,
                        input: "",
                        revealed: false,
                        analysis: [
                            fillLetterGrid({
                                grid: analysis[0].grid,
                                mode: "perpetual",
                            }),
                        ],
                        lastGameStart: lastGameStart
                            ? lastGameStart
                            : Date.now(),
                    }
                }
                return {}
            }
        },
    },
    {
        onChange: ({ rows, columns, mode }, context) => {
            if (rows || columns) {
                context.store.actions.refreshGrid()
            }
            const min = (x: number, y: number) => (x <= y ? x : y)
            if (mode) {
                const currentDimensions = context.store.query({
                    rows: true,
                    columns: true,
                })
                context.store.update({
                    rows: min(
                        currentDimensions.rows,
                        gridDimensionsByMode[mode].max
                    ),
                    columns: min(
                        currentDimensions.columns,
                        gridDimensionsByMode[mode].max
                    ),
                    pangramsFound: 0,
                })
                context.store.actions.refreshGrid({ mode })
            }
        },
    }
)
