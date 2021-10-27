import React, { CSSProperties } from "react"
import { Button, Column, Row, Text } from "@re-do/components"
import { Mode, store } from "./state"
import Slider from "@material-ui/core/Slider"
import { RadioGroup, FormControlLabel } from "@material-ui/core"
import { Radio } from "@material-ui/core"
import { gridDimensionsByMode, pathToWord } from "./generateGrid.js"

type ActionButtonProps = {
    text: string
    style?: CSSProperties
    onClick: (...args: any[]) => void
}

const ActionButton = ({ text, style, onClick }: ActionButtonProps) => (
    <Button style={style} kind="secondary" onClick={onClick}>
        {text}
    </Button>
)

export type ActionsProps = {}

export const Actions = ({}: ActionsProps) => {
    const { mode, hintPath } = store.useQuery({
        mode: true,
        hintPath: true,
    })
    // @ts-ignore
    const analysis = store.useGet("analysis")[0]
    const pangramPath =
        mode === "pangram" ? Object.values(analysis.solutions)[0].paths[0] : []
    return (
        <Column style={{ padding: 8 }}>
            <Row justify="center">
                {mode === "pangram" ? (
                    <ActionButton
                        style={{ marginRight: 8, marginLeft: 8 }}
                        onClick={() => {
                            if (hintPath.length !== pangramPath.length) {
                                const updatedHintPath = [
                                    ...hintPath,
                                    pangramPath[hintPath.length],
                                ]
                                const hintPrefix = pathToWord(
                                    updatedHintPath,
                                    analysis
                                )
                                store.update({
                                    hintPath: updatedHintPath,
                                    input: hintPrefix,
                                    error: "",
                                    path: updatedHintPath,
                                    isValid: true,
                                })
                            }
                        }}
                        text="Hint"
                    />
                ) : null}
                <ActionButton
                    style={{ marginLeft: 8, marginRight: 8 }}
                    onClick={() =>
                        store.update({
                            revealed: true,
                        })
                    }
                    text="Spoilers"
                />
                <ActionButton
                    style={{ marginLeft: 8, marginRight: 8 }}
                    text="New Game"
                    onClick={() => {
                        store.$.refreshGrid()
                    }}
                />
            </Row>
            {/* 
            If we don't specify overflow hidden, the sliders unnecessarily overflow:
            https://github.com/mui-org/material-ui/issues/13455
             */}
            <Row justify="center" style={{ overflow: "hidden", padding: 16 }}>
                <Column style={{ paddingRight: 16 }}>
                    <Text>Mode</Text>
                    <RadioGroup
                        defaultValue="pangram"
                        onChange={({ target }) =>
                            store.update({ mode: target.value as Mode })
                        }
                    >
                        <FormControlLabel
                            value="pangram"
                            control={<Radio />}
                            label="Pangram"
                        />
                        <FormControlLabel
                            value="freesearch"
                            control={<Radio />}
                            label="Freesearch"
                        />
                        <FormControlLabel
                            value="perpetual"
                            control={<Radio />}
                            label="Perpetual"
                        />
                    </RadioGroup>
                </Column>
                <Column>
                    <Text>Rows</Text>
                    <Slider
                        defaultValue={gridDimensionsByMode[mode].default}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={gridDimensionsByMode[mode].min}
                        max={gridDimensionsByMode[mode].max}
                        onChange={(e, value) => {
                            store.update({ rows: value as number })
                        }}
                    />
                </Column>
                <Column style={{ paddingLeft: 16 }}>
                    <Text>Columns</Text>
                    <Slider
                        defaultValue={gridDimensionsByMode[mode].default}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={gridDimensionsByMode[mode].min}
                        max={gridDimensionsByMode[mode].max}
                        onChange={(e, value) => {
                            store.update({ columns: value as number })
                        }}
                    />
                </Column>
            </Row>
        </Column>
    )
}
