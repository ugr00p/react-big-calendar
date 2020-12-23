import PropTypes from 'prop-types'
import React from 'react'
import EventRowMixin from './EventRowMixin'

class EventRow extends React.Component {
  static propTypes = {
    segments: PropTypes.array,
    fixedSpan: PropTypes.bool,
    ...EventRowMixin.propTypes,
  }
  static defaultProps = {
    fixedSpan: false,
    ...EventRowMixin.defaultProps,
  }
  render() {
    let { segments, slots, fixedSpan } = this.props

    let lastEnd = 1

    return (
      <div className="rbc-row">
        {segments.reduce((row, { event, left, right, span }, li) => {
          let key = '_lvl_' + li
          let gap = left - lastEnd

          let content = EventRowMixin.renderEvent(this.props, event)

          if (gap) row.push(EventRowMixin.renderSpan(slots, gap, `${key}_gap`))
          row.push(
            !fixedSpan
              ? EventRowMixin.renderSpan(slots, span, key, content)
              : EventRowMixin.renderFixedSpan(key, content)
          )

          lastEnd = right + 1

          return row
        }, [])}
      </div>
    )
  }
}

export default EventRow
