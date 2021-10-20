import React from "react"
import { Row, Text } from "@re-do/components"
import { Icons } from "@re-do/components"
import Accordion, { AccordionProps } from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import AccordionDetails from "@material-ui/core/AccordionDetails"

export type ExpandableProps = Partial<AccordionProps> & {
    summary: string
    children: JSX.Element | JSX.Element[]
}

export const Expandable = ({
    summary,
    children,
    defaultExpanded,
    ...rest
}: ExpandableProps) => {
    return (
        <Accordion
            key={summary}
            style={{
                background: "transparent",
            }}
            elevation={0}
            defaultExpanded={defaultExpanded ?? false}
            {...rest}
        >
            <AccordionSummary expandIcon={<Icons.expandDown />}>
                <Row align="center">
                    <Text variant="h6">{summary}</Text>
                </Row>
            </AccordionSummary>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    )
}
