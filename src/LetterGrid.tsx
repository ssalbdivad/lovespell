import React from "react"
import { Row, Column, Text } from "@re-do/components"
import { generateLetterGrid, Position } from "./generateGrid"
import { store } from "./state"
import { isEmpty, transform } from "@re-do/utils"
import { randomRgbFromSeed, randomRgbStringFromSeed } from "./random.js"
import { Letter } from "./dictionary.js"

export type LetterGridProps = {}

export const colorForPosition = (
    position: Position,
    letter: Letter,
    path: Position[]
) =>
    randomRgbFromSeed({
        position,
        letter,
    })

export const colorStringForPosition = (
    position: Position,
    letter: Letter,
    path: Position[]
) =>
    randomRgbStringFromSeed(
        {
            position,
            letter,
        },
        {
            transparency: path.includes(position as Position) ? 1 : 0.2,
        }
    )

export const LetterGrid = ({}: LetterGridProps) => {
    // @ts-ignore
    const [analysis] = store.useGet("analysis")
    const { rows, columns, path, mode } = store.useQuery({
        rows: true,
        columns: true,
        path: true,
        mode: true,
    })
    const availablePositions = isEmpty(path)
        ? Object.keys(analysis.grid)
        : Object.keys(analysis.grid[path[path.length - 1]].adjacent)
    return (
        <Column
            style={{
                height: `min(60vh, ${rows * 88}px)`,
                width: `min(60vh, ${columns * 88}px)`,
            }}
        >
            {Object.entries(analysis.grid)
                .reduce((grid, [position, { value: letter, adjacent }]) => {
                    const [x, y] = position.split(",").map((_) => parseInt(_))
                    if (!grid[x]) {
                        grid[x] = []
                    }
                    const color = colorStringForPosition(
                        position as Position,
                        letter,
                        path
                    )
                    grid[x][y] = (
                        <Row
                            key={y}
                            justify="center"
                            style={{
                                margin: 4,
                                border: `solid ${color}`,
                                borderRadius: "50%",
                                boxShadow:
                                    "0.3em 0.3em 0 0 rgba(15, 28, 63, 0.125)",
                            }}
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
