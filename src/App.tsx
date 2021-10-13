import React from "react"
import { AppContents, Column, Row } from "@re-do/components"
import { StatelessProvider } from "react-statelessly"
import { store } from "./state"
import { SolutionProgress } from "./SolutionProgress.js"
import { Game } from "./Game.js"

export const App = () => (
    <StatelessProvider store={store}>
        <AppContents>
            <Column full justify="center" align="center">
                <Row justify="center" align="center" style={{ maxWidth: 1200 }}>
                    <Column align="center">
                        <Game />
                    </Column>
                    <Column>
                        <SolutionProgress />
                    </Column>
                </Row>
            </Column>
        </AppContents>
    </StatelessProvider>
)
