import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class TimeGroup extends Component {
  static propTypes = {
    renderSlot: PropTypes.func,
    value: PropTypes.number,
    groupClassName: PropTypes.string,
    totalSlots: PropTypes.array,
    isLast: PropTypes.bool,
  }
  static defaultProps = {
    totalSlots: [0, 1, 2, 3],
    isLast: false,
  }

  render() {
    const { groupClassName, totalSlots, renderSlot, value, isLast } = this.props

    return (
      <div className={groupClassName}>
        {totalSlots.map((time, idx) => {
          return renderSlot(value, idx, isLast)
        })}
      </div>
    )
  }
}
