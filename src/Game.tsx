import React from "react"
import { LetterGrid } from "./LetterGrid"
import Refresh from "@material-ui/icons/Refresh"
import Visibility from "@material-ui/icons/Visibility"
import { Button, Column, Row, Text } from "@re-do/components"
import { store } from "./state"
import { WordInput } from "./WordInput"
import { generateLetterGrid } from "./generateLetterGrid"
import Slider from "@material-ui/core/Slider"

export type GameProps = {}

export const Game = ({}: GameProps) => {
    return (
        <Column>
            <LetterGrid />
            <Row justify="center">
                <Button
                    Icon={Visibility}
                    onClick={() =>
                        store.update({
                            revealed: true,
                        })
                    }
                />
                <Button
                    Icon={Refresh}
                    onClick={() => {
                        const { rows, columns } = store.query({
                            rows: true,
                            columns: true,
                        })
                        store.update({
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
                        })
                    }}
                />
            </Row>
            <WordInput />
            <Row justify="center" spacing={8}>
                <Column>
                    <Text>Rows</Text>
                    <Slider
                        defaultValue={3}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={2}
                        max={6}
                        onChange={(e, value) => {
                            store.update({ rows: value as number })
                        }}
                    />
                </Column>
                <Column>
                    <Text>Columns</Text>
                    <Slider
                        defaultValue={3}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={2}
                        max={6}
                        onChange={(e, value) => {
                            store.update({ columns: value as number })
                        }}
                    />
                </Column>
            </Row>
        </Column>
    )
}
