import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class TimeGroup extends Component {
  static propTypes = {
    renderSlot: PropTypes.func,
    value: PropTypes.number,
    groupClassName: PropTypes.string,
    totalSlots: PropTypes.array,
  }
  static defaultProps = {
    totalSlots: [0, 1, 2, 3],
  }

  render() {
    const { groupClassName, totalSlots, renderSlot, value } = this.props

    return (
      <div className={groupClassName}>
        {totalSlots.map((time, idx) => {
          return renderSlot(value, idx)
        })}
      </div>
    )
  }
}
