import { generateLetterGrid, LetterAnalysis, Position } from "./generateGrid"
import { Store } from "react-statelessly"
import { getScore, isWord } from "./dictionary.js"

export const isMobile = window.innerWidth <= 800

export type Mode = "pangram" | "freesearch"

export const store = new Store(
    {
        // Putting it in array to avoid statelessly treating it like a substate
        analysis: [{ grid: {}, appearancesOf: {}, words: {} }] as [
            LetterAnalysis
        ],
        wordsFound: [] as string[],
        mode: "freesearch" as Mode,
        input: "",
        path: [] as Position[],
        isValid: true,
        error: "",
        score: 0,
        revealed: false,
        rows: 3,
        columns: 3,
    },
    {
        refreshGrid: (args, store) => {
            const { rows, columns, mode } = store.query({
                rows: true,
                columns: true,
                mode: true,
            })
            return {
                analysis: [
                    generateLetterGrid({
                        rows,
                        columns,
                        mode,
                    }),
                ],
                score: 0,
                wordsFound: [],
                path: [],
                input: "",
                isValid: true,
                revealed: false,
            }
        },
        submitInput: (args, store) => {
            const { isValid, input, wordsFound } = store.query({
                wordsFound: true,
                isValid: true,
                input: true,
            })
            if (!isValid) {
                return { error: "You can't spell that!" }
            } else if (input.length < 3) {
                return { error: "3+ letters. I believe in you." }
            } else if (wordsFound.includes(input)) {
                return { error: "You already found that!" }
            } else if (!isWord(input)) {
                return { error: "I don't think that's a word..." }
            } else {
                return {
                    wordsFound: (_) => [..._, input],
                    score: (_) => _ + getScore(input),
                    path: [],
                    error: "",
                    isValid: true,
                    input: "",
                }
            }
        },
    },
    {
        onChange: ({ rows, columns, mode }, context) => {
            if (rows || columns || mode) {
                context.store.actions.refreshGrid()
            }
        },
    }
)
