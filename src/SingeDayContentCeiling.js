import PropTypes from 'prop-types'
import React from 'react'
import { accessor, elementType } from './utils/propTypes'
import {
  singleDayPinSegments,
  endOfRange,
  eventLevels,
} from './utils/eventLevels'
import EventRow from './EventRow'
import getHeight from 'dom-helpers/query/height'
import { findDOMNode } from 'react-dom'

const propTypes = {
  events: PropTypes.array.isRequired,
  range: PropTypes.array.isRequired,
  renderForMeasure: PropTypes.bool,

  onSelectSlot: PropTypes.func,

  startAccessor: accessor.isRequired,
  endAccessor: accessor.isRequired,

  eventComponent: elementType,
  eventWrapperComponent: elementType.isRequired,
  minRows: PropTypes.number.isRequired,
  maxRows: PropTypes.number.isRequired,
  intervals: PropTypes.array,
}

const defaultProps = {
  minRows: 0,
  maxRows: Infinity,
}

class SingeDayContentCeiling extends React.Component {
  handleSelectSlot = slot => {
    const { range, onSelectSlot } = this.props

    onSelectSlot(range.slice(slot.start, slot.end + 1), slot)
  }

  createHeadingRef = r => {
    this.headingRow = r
  }

  createEventRef = r => {
    this.eventRow = r
  }

  getRowLimit() {
    let eventHeight = getHeight(this.eventRow)
    let headingHeight = this.headingRow ? getHeight(this.headingRow) : 0
    let eventSpace = getHeight(findDOMNode(this)) - headingHeight

    return Math.max(Math.floor(eventSpace / eventHeight), 1)
  }

  renderDummy = () => {
    let { className } = this.props
    return (
      <div className={className}>
        <div className="rbc-row-content">
          <div className="rbc-ceiling" ref={this.createEventRef}>
            <div className="rbc-row-segment">
              <div className="rbc-event">
                <div className="rbc-event-content">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      events,
      range,
      className,
      renderForMeasure,
      startAccessor,
      endAccessor,
      eventComponent,
      eventWrapperComponent,
      intervals,
      minRows,
      maxRows,
      ...props
    } = this.props

    if (renderForMeasure) return this.renderDummy()

    let { first, last } = endOfRange(range)
    let segments = (this.segments = events.map(evt =>
      singleDayPinSegments(
        evt,
        first,
        last,
        {
          startAccessor,
        },
        intervals
      )
    ))
    let { levels } = eventLevels(segments, Math.max(maxRows - 1, 1))
    while (levels.length < minRows) levels.push([])
    return (
      <div className={className}>
        <div className="rbc-row-content">
          {levels.map((segs, idx) => (
            <EventRow
              fixedSpan={true}
              {...props}
              key={idx}
              start={first}
              end={last}
              segments={segs}
              slots={intervals.length}
              eventComponent={eventComponent}
              eventWrapperComponent={eventWrapperComponent}
              startAccessor={startAccessor}
              endAccessor={endAccessor}
            />
          ))}
        </div>
      </div>
    )
  }
}

SingeDayContentCeiling.propTypes = propTypes
SingeDayContentCeiling.defaultProps = defaultProps

export default SingeDayContentCeiling
