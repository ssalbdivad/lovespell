import React from "react"
import { Row, Column, Text } from "@re-do/components"
import { generateLetterGrid, LetterPosition } from "./generateLetterGrid"
import { store } from "./state"
import { isEmpty, transform } from "@re-do/utils"
import LineTo from "react-lineto"
import { getSegments } from "./WordInput.js"

export type LetterGridProps = {}

export const LetterGrid = ({}: LetterGridProps) => {
    // @ts-ignore
    const [analysis] = store.useGet("analysis")
    // @ts-ignore
    const [segments] = store.useGet("segments")
    const { rows, columns, currentPath } = store.useQuery({
        rows: true,
        columns: true,
        currentPath: true,
    })
    const availablePositions = isEmpty(currentPath)
        ? Object.keys(analysis.adjacencies)
        : Object.values(
              analysis.adjacencies[currentPath.at(-1)!].adjacent
          ).flatMap((_) => _)
    if (isEmpty(analysis.words)) {
        // Either this is first render or we generated a grid with no solutions, so generate a new one
        store.update({
            analysis: [generateLetterGrid({ rows, columns })],
        })
    }
    return (
        <Column
            style={{
                height: `min(60vh, ${rows * 80}px)`,
                width: `min(60vh, ${columns * 80}px)`,
            }}
        >
            {Object.entries(analysis.adjacencies)
                .reduce((grid, [position, { letter, adjacent }]) => {
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
                                        ...currentPath,
                                        position as LetterPosition,
                                    ]
                                    store.update({
                                        input: nextPath
                                            .map(
                                                (position) =>
                                                    analysis.adjacencies[
                                                        position!
                                                    ].letter
                                            )
                                            .join(""),
                                        currentPath: nextPath,
                                        segments: [
                                            getSegments(
                                                true,
                                                nextPath as LetterPosition[],
                                                segments
                                            ),
                                        ],
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
