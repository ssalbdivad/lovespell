import React, { useState } from "react"
import { LetterGrid } from "./LetterGrid"
import Refresh from "@material-ui/icons/Refresh"
import Visibility from "@material-ui/icons/Visibility"
import { Button, Column, Row, Text } from "@re-do/components"
import { isMobile, store } from "./state"
import { WordInput } from "./WordInput"
import { generateLetterGrid } from "./generateLetterGrid"
import Slider from "@material-ui/core/Slider"

export type ActionsProps = {}

export const Actions = ({}: ActionsProps) => {
    return (
        <Column style={{ padding: 8 }}>
            <Row justify="center">
                <Button
                    style={{ marginRight: 8 }}
                    kind="secondary"
                    onClick={() =>
                        store.update({
                            revealed: true,
                        })
                    }
                >
                    Spoilers
                </Button>
                <Button
                    style={{ marginLeft: 8 }}
                    kind="secondary"
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
                            input: "",
                            error: "",
                        })
                    }}
                >
                    New Game
                </Button>
            </Row>
            {/* 
            If we don't specify overflow hidden, the sliders unnecessarily overflow:
            https://github.com/mui-org/material-ui/issues/13455
             */}
            <Row justify="center" style={{ overflow: "hidden", padding: 16 }}>
                <Column style={{ paddingRight: 16 }}>
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
                <Column style={{ paddingLeft: 16 }}>
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
