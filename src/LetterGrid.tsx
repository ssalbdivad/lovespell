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
    return (
        <Column>
            {analysis.grid?.map((row, rowIndex) => (
                <Row key={rowIndex} justify="center">
                    {row.map((letter, columnIndex) => (
                        <Row
                            key={columnIndex}
                            justify="center"
                            style={{ height: 100, width: 100 }}
                        >
                            <Text
                                className={`${rowIndex},${columnIndex}`}
                                style={{ fontSize: 50 }}
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
