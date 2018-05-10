import cn from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { dateFormat } from './utils/propTypes'
import TimeGroup from './TimeGroup'

export default class SingleDayContentGutter extends Component {
  static propTypes = {
    timesRange: PropTypes.array.isRequired,
    timeGutterFormat: dateFormat,
    culture: PropTypes.string,
    resource: PropTypes.string,
  }

  renderSlot = (value, idx) => {
    if (idx !== 0) return null
    return (
      <div
        key={`time${value}`}
        className={cn('rbc-time-slot', 'rbc-ruler-label')}
      >
        {value}
      </div>
    )
  }

  renderRuler = (value, idex) => {
    let classname = 'rbc-ruler-slot'
    if (idex === 1 || idex === 3) {
      classname = 'rbc-ruler-slot-lowBar'
    } else if (idex === 2) {
      classname = 'rbc-ruler-slot-mediumBar'
    }
    return <div key={`ruler${idex}`} className={cn(classname)} />
  }

  render() {
    const { timesRange } = this.props
    return (
      <div>
        <div className="rbc-time-gutter rbc-ruler-row">
          {timesRange.map((time, idx) => {
            return (
              <TimeGroup
                key={idx}
                value={time}
                groupClassName={'rbc-ruler-group'}
                renderSlot={this.renderRuler}
              />
            )
          })}
        </div>
        <div className="rbc-time-gutter rbc-time-row">
          {timesRange.map((time, idx) => {
            return (
              <TimeGroup
                key={idx}
                groupClassName={'rbc-time-group'}
                value={idx}
                renderSlot={this.renderSlot}
              />
            )
          })}
        </div>
      </div>
    )
  }
}
