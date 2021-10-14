import React from "react"
import { Row, Column, Text } from "@re-do/components"
import { generateLetterGrid } from "./generateLetterGrid"
import { store } from "./state"
import { isEmpty } from "@re-do/utils"

export type LetterGridProps = {}

export const LetterGrid = ({}: LetterGridProps) => {
    // @ts-ignore
    const [analysis] = store.useGet("analysis")
    const { rows, columns } = store.useQuery({ rows: true, columns: true })
    if (isEmpty(analysis.grid)) {
        store.update({ analysis: [generateLetterGrid({ rows, columns })] })
    }
    console.log("")
    return (
        <Column
            style={{
                height: `min(60vh, ${rows * 80}px)`,
                width: `min(60vh, ${columns * 80}px)`,
            }}
        >
            {analysis.grid?.map((row, rowIndex) => (
                <Row key={rowIndex} justify="center">
                    {row.map((letter, columnIndex) => (
                        <Row key={columnIndex} justify="center">
                            <Text
                                className={`${rowIndex},${columnIndex}`}
                                style={{
                                    fontSize: `min(${
                                        60 / Math.max(rows, columns)
                                    }vh, 50px)`,
                                }}
                            >
                                {letter}
                            </Text>
                        </Row>
                    ))}
                </Row>
            ))}
        </Column>
    )
}
