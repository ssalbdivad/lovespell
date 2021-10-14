import React from "react"
import { Row, Column, Text } from "@re-do/components"
import { generateLetterGrid } from "./generateLetterGrid"
import { isMobile, store } from "./state"
import { isEmpty, transform } from "@re-do/utils"
import LineTo from "react-lineto"

export type LetterGridProps = {}

export const LetterGrid = ({}: LetterGridProps) => {
    // @ts-ignore
    const [analysis] = store.useGet("analysis")
    // @ts-ignore
    const [segments] = store.useGet("segments")
    const { rows, columns } = store.useQuery({ rows: true, columns: true })
    if (isEmpty(analysis.grid)) {
        store.update({ analysis: [generateLetterGrid({ rows, columns })] })
    }
    return (
        <Column
            style={{
                height: `min(60vh, ${rows * 80}px)`,
                width: `min(60vh, ${columns * 80}px)`,
            }}
        >
            {analysis.grid?.map((row, rowIndex) => (
                <Row key={rowIndex} justify="center">
                    {row.map((letter, columnIndex) => {
                        const addLetterToInput = () =>
                            store.update({
                                input: (current) =>
                                    `${current}${letter}`.toLowerCase(),
                            })
                        return (
                            <Row
                                key={columnIndex}
                                justify="center"
                                onClick={addLetterToInput}
                            >
                                <Text
                                    className={`${rowIndex},${columnIndex}`}
                                    style={{
                                        fontSize: `min(${
                                            60 / Math.max(rows, columns)
                                        }vh, 50px)`,
                                        // Ensure letters appear above segments
                                        zIndex: 2,
                                    }}
                                >
                                    {letter}
                                </Text>
                            </Row>
                        )
                    })}
                </Row>
            ))}
            {segments
                ? transform(
                      segments,
                      ([segmentName, color], index) => [
                          index,
                          <LineTo
                              key={index}
                              from={segmentName.split(":")[0]}
                              to={segmentName.split(":")[1]}
                              borderWidth={5}
                              borderColor={color}
                          />,
                      ],
                      { asValueArray: true }
                  )
                : null}
        </Column>
    )
}
