import {
    generateLetterGrid,
    LetterAnalysis,
    LetterPosition,
} from "./generateLetterGrid"
import { Store } from "react-statelessly"
import { getSegments, getValidPaths } from "./WordInput.js"
import { getScore, isWord } from "./dictionary.js"

export const isMobile = window.innerWidth <= 800

export type Segments = {
    [K in `${LetterPosition}:${LetterPosition}`]: `rgb(${number}, ${number}, ${number})`
}

export const store = new Store(
    {
        // Putting it in array to avoid statelessly treating it like a substate
        analysis: [{ adjacencies: {}, positions: {}, words: {} }] as [
            LetterAnalysis
        ],
        wordsFound: [] as string[],
        segments: [{}] as [Segments],
        input: "",
        currentPath: [] as LetterPosition[],
        isValid: false,
        error: "",
        score: 0,
        revealed: false,
        rows: 3,
        columns: 3,
    },
    {
        refreshGrid: (args, store) => {
            const { rows, columns } = store.query({
                rows: true,
                columns: true,
            })
            return {
                analysis: [
                    generateLetterGrid({
                        rows,
                        columns,
                    }),
                ],
                score: 0,
                wordsFound: [],
                currentPath: [],
                isValid: false,
                segments: [{}],
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
            }
            // else if (input.length < 3) {
            //     setError(

            //        "3+ letters. I believe in you.",
            //     )
            //}
            else if (wordsFound.includes(input)) {
                return { error: "You already found that!" }
            } else if (!isWord(input)) {
                return { error: "I don't think that's a word..." }
            } else {
                return {
                    wordsFound: (_) => [..._, input],
                    score: (_) => _ + getScore(input),
                    currentPath: [],
                    segments: [{}],
                    error: "",
                    isValid: false,
                    input: "",
                }
            }
        },
    },
    {
        onChange: ({ rows, columns }, context) => {
            if (rows || columns) {
                context.store.actions.refreshGrid()
            }
        },
    }
)
