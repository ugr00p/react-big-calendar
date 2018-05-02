import getHeight from 'dom-helpers/query/height'
import PropTypes from 'prop-types'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { DAY_FIFTEEN_MINS_INTERVAL } from './utils/dates'
import { accessor, elementType } from './utils/propTypes'
import {
  singleDayEventSegments,
  endOfRange,
  eventLevels,
} from './utils/eventLevels'
import EventRow from './EventRow'

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
  dayStartTime: PropTypes.number,
  dayEndTime: PropTypes.number,
  dayIntervalGetter: PropTypes.func.isRequired,
}

const defaultProps = {
  minRows: 0,
  maxRows: Infinity,
  dayStartTime: 0,
  dayEndTime: 24,
  dayIntervalGetter: DAY_FIFTEEN_MINS_INTERVAL,
}

class SingleDayContentRow extends React.Component {
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
          <div className="rbc-row" ref={this.createEventRef}>
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
      minRows,
      maxRows,
      eventComponent,
      eventWrapperComponent,
      dayIntervalGetter,
      dayStartTime,
      dayEndTime,
      ...props
    } = this.props

    if (renderForMeasure) return this.renderDummy()

    let { first, last } = endOfRange(range)
    const dayIntervals = dayIntervalGetter(dayStartTime, dayEndTime)
    let segments = (this.segments = events.map(evt =>
      singleDayEventSegments(
        evt,
        first,
        last,
        {
          startAccessor,
          endAccessor,
        },
        dayIntervals
      )
    ))
    let { levels } = eventLevels(segments, Math.max(maxRows - 1, 1))
    while (levels.length < minRows) levels.push([])

    return (
      <div className={className}>
        <div className="rbc-row-content">
          {levels.map((segs, idx) => (
            <EventRow
              {...props}
              key={idx}
              start={first}
              end={last}
              segments={segs}
              slots={dayIntervals.length}
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

SingleDayContentRow.propTypes = propTypes
SingleDayContentRow.defaultProps = defaultProps

export default SingleDayContentRow
