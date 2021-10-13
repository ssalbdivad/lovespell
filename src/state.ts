import {
    generateLetterGrid,
    LetterAnalysis,
    LetterPosition,
} from "./generateLetterGrid"
import { Store } from "react-statelessly"

export type Segments = {
    [K in `${LetterPosition}:${LetterPosition}`]: `rgb(${number}, ${number}, ${number})`
}

export const store = new Store(
    {
        // Putting it in array to avoid statelessly treating it like a substate
        analysis: [{ adjacencies: {}, grid: [], positions: {}, words: {} }] as [
            LetterAnalysis
        ],
        wordsFound: [] as string[],
        segments: [{}] as [Segments],
        score: 0,
        revealed: false,
        rows: 3,
        columns: 3,
    },
    {
        refreshGrid: (context, store) => {
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
                isValid: false,
                segments: [{}],
                revealed: false,
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
