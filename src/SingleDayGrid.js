import PropTypes from 'prop-types'
import raf from 'dom-helpers/util/requestAnimationFrame'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'

import dates, { TIME_INTERVAL } from './utils/dates'
import { accessor, dateFormat } from './utils/propTypes'
import { notify } from './utils/helpers'
import { accessor as get } from './utils/accessors'
import { inRange, sortEvents } from './utils/eventLevels'
import SingleDayContentRow from './SingleDayContentRow'
import SingleDayContentGutter from './SingleDayContentGutter'

export default class SingleDayGrid extends Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    resources: PropTypes.array,

    step: PropTypes.number,
    range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
    min: PropTypes.instanceOf(Date),
    max: PropTypes.instanceOf(Date),

    eventPropGetter: PropTypes.func,
    dayFormat: dateFormat,
    culture: PropTypes.string,

    titleAccessor: accessor.isRequired,
    tooltipAccessor: accessor.isRequired,
    startAccessor: accessor.isRequired,
    endAccessor: accessor.isRequired,
    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),

    onSelectSlot: PropTypes.func,
    onSelectEvent: PropTypes.func,
    onDoubleClickEvent: PropTypes.func,
    messages: PropTypes.object,
    components: PropTypes.object.isRequired,
    dayStartTime: PropTypes.number,
    dayEndTime: PropTypes.number,
    timeIntervalGetter: PropTypes.func.isRequired,
  }

  static defaultProps = {
    step: 30,
    timeslots: 2,
    min: dates.startOf(new Date(), 'day'),
    max: dates.endOf(new Date(), 'day'),
    scrollToTime: dates.startOf(new Date(), 'day'),
    defaultDate: new Date('0001-01-01'),
    dayStartTime: 0,
    dayEndTime: 24,
    timeIntervalGetter: TIME_INTERVAL,
  }

  constructor(props) {
    super(props)

    this.state = { gutterWidth: undefined, isOverflowing: null }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    raf.cancel(this.rafHandle)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    raf.cancel(this.rafHandle)
  }

  gutterRef = ref => {
    this.gutter = ref && findDOMNode(ref)
  }

  handleSelectAlldayEvent = (...args) => {
    //cancel any pending selections so only the event click goes through.
    this.clearSelection()
    notify(this.props.onSelectEvent, args)
  }

  handleSelectAllDaySlot = (slots, slotInfo) => {
    const { onSelectSlot } = this.props
    notify(onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
    })
  }

  render() {
    let {
      events,
      range,
      startAccessor,
      endAccessor,
      selected,
      components,
      timeIntervalGetter,
      dayStartTime,
      dayEndTime,
    } = this.props

    let start = range[0],
      end = range[range.length - 1]

    let singleDayEvents = []
    const fifteenMinsInterval = timeIntervalGetter(dayStartTime, dayEndTime)
    const hourInterval = timeIntervalGetter(dayStartTime, dayEndTime, 1)
    events.forEach(event => {
      if (inRange(event, start, end, this.props)) {
        let eStart = get(event, startAccessor),
          eEnd = get(event, endAccessor)
        if (dates.neq(eStart, eEnd) && dates.gt(eEnd, eStart)) {
          singleDayEvents.push(event)
        }
      }
    })

    singleDayEvents.sort((a, b) => sortEvents(a, b, this.props))
    return (
      <div className="rbc-singleDay-time-view">
        <div className="rbc-singleDay-container">
          <SingleDayContentRow
            minRows={1}
            range={range}
            events={singleDayEvents}
            className="rbc-allday-cell"
            selected={selected}
            eventComponent={components.event}
            eventWrapperComponent={components.eventWrapper}
            titleAccessor={this.props.titleAccessor}
            tooltipAccessor={this.props.tooltipAccessor}
            startAccessor={startAccessor}
            endAccessor={endAccessor}
            eventPropGetter={this.props.eventPropGetter}
            onSelect={this.handleSelectAlldayEvent}
            onDoubleClick={this.props.onDoubleClickEvent}
            onSelectSlot={this.handleSelectAllDaySlot}
            intervals={fifteenMinsInterval}
          />
        </div>
        <SingleDayContentGutter timesRange={hourInterval} />
      </div>
    )
  }

  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }
}
