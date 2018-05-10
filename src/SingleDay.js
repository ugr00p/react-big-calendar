import PropTypes from 'prop-types'
import React from 'react'
import SingleDayGrid from './SingleDayGrid'
import dates from './utils/dates'
import localizer from './localizer'
import { accessor as get } from './utils/accessors'
import { accessor } from './utils/propTypes'

class SingleDay extends React.Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    events: PropTypes.array.isRequired,
    startAccessor: accessor.isRequired,
    endAccessor: accessor.isRequired,
    defaultDate: PropTypes.object,
  }

  static defaultProps = SingleDayGrid.defaultProps

  render() {
    let { events, defaultDate, ...props } = this.props
    let range = SingleDay.range(defaultDate, this.props)
    let dayEvents = this.stripEventDate(events)
    return (
      <SingleDayGrid
        {...props}
        events={dayEvents}
        range={range}
        eventOffset={15}
      />
    )
  }

  stripEventDate(events) {
    let { startAccessor, endAccessor } = this.props
    events.forEach(event => {
      let eStart = get(event, startAccessor),
        eEnd = get(event, endAccessor)
      event.start = dates.stripDate(eStart)
      event.end = dates.stripDate(eEnd)
    })
    return events
  }
}

SingleDay.range = date => {
  return [dates.startOf(date, 'day')]
}

SingleDay.title = (date, { formats, culture }) =>
  localizer.format(date, formats.dayHeaderFormat, culture)

export default SingleDay
