import React from "react"
import { Row, Column, Text } from "@re-do/components"
import { generateLetterGrid, Position } from "./generateGrid"
import { store } from "./state"
import { isEmpty, transform } from "@re-do/utils"

export type LetterGridProps = {}

export const LetterGrid = ({}: LetterGridProps) => {
    // @ts-ignore
    const [analysis] = store.useGet("analysis")
    const { rows, columns, path, mode } = store.useQuery({
        rows: true,
        columns: true,
        path: true,
        mode: true,
    })
    if (isEmpty(analysis.solutions)) {
        // Either this is first render or we generated a grid with no solutions, so generate a new one
        store.update({
            analysis: [generateLetterGrid({ rows, columns, mode })],
        })
    }
    const availablePositions = isEmpty(path)
        ? Object.keys(analysis.grid)
        : Object.keys(analysis.grid[path.at(-1)!].adjacent)
    return (
        <Column
            style={{
                height: `min(60vh, ${rows * 80}px)`,
                width: `min(60vh, ${columns * 80}px)`,
            }}
        >
            {Object.entries(analysis.grid)
                .reduce((grid, [position, { value: letter, adjacent }]) => {
                    const [x, y] = position.split(",").map((_) => parseInt(_))
                    if (!grid[x]) {
                        grid[x] = []
                    }
                    grid[x][y] = (
                        <Row
                            key={y}
                            justify="center"
                            onClick={() => {
                                if (availablePositions.includes(position)) {
                                    const nextPath = [
                                        ...path,
                                        position as Position,
                                    ]
                                    store.update({
                                        input: nextPath
                                            .map(
                                                (position) =>
                                                    analysis.grid[position!]
                                                        .value
                                            )
                                            .join(""),
                                        path: nextPath,
                                        isValid: true,
                                    })
                                }
                            }}
                        >
                            <Text
                                className={`${x},${y}`}
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
                    return grid
                }, [] as JSX.Element[][])
                .map((row, index) => (
                    <Row key={index} justify="center">
                        {row}
                    </Row>
                ))}
        </Column>
    )
}
