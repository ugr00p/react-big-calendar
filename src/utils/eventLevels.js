import findIndex from 'lodash/findIndex'
import dates from './dates'
import { accessor as get } from './accessors'

export function endOfRange(dateRange, unit = 'day') {
  return {
    first: dateRange[0],
    last: dates.add(dateRange[dateRange.length - 1], 1, unit),
  }
}

export function eventSegments(
  event,
  first,
  last,
  { startAccessor, endAccessor },
  range
) {
  let slots = dates.diff(first, last, 'day')
  let start = dates.max(dates.startOf(get(event, startAccessor), 'day'), first)
  let end = dates.min(dates.ceil(get(event, endAccessor), 'day'), last)
  console.log(slots)
  console.log(start)
  console.log(end)

  let padding = findIndex(range, x => dates.eq(x, start, 'day'))
  console.log(padding)
  let span = dates.diff(start, end, 'day')
  console.log(span)
  span = Math.min(span, slots)
  span = Math.max(span, 1)

  return {
    event,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  }
}

export function singleDayEventSegments(
  event,
  first,
  last,
  { startAccessor, endAccessor },
  range
) {
  let slots = dates.diff(first, last, 'hours') * 4
  let start = dates.max(
    dates.startOf(get(event, startAccessor), 'hours'),
    first
  )
  let end = dates.min(dates.startOf(get(event, endAccessor), 'hours'), last)
  console.log('start', start)
  console.log('end', end)
  let eStart = get(event, startAccessor)
  let eEnd = get(event, endAccessor)
  let hours = dates.hours(eStart)
  let eStartMins = dates.minutes(eStart)
  let eEndMins = dates.minutes(eEnd)
  let roundStartMins
  let roundEndMins
  if (eStartMins % 15 > 7) {
    roundStartMins = Math.ceil(eStartMins / 15) * 15
    roundEndMins = Math.ceil(eEndMins / 15) * 15
  } else {
    roundStartMins = Math.floor(eStartMins / 15) * 15
    roundEndMins = Math.ceil(eEndMins / 15) * 15
  }

  let hourMins = hours + roundStartMins / 60
  console.log('hours', hours)
  console.log('mins', roundStartMins)
  console.log('hourMins', hourMins)
  let padding = findIndex(range, x => x === hourMins)
  let spanHour = dates.diff(start, end, 'hours') * 4
  let spanMin = (roundEndMins - roundStartMins) / 15
  console.log('padding', padding)
  spanHour = Math.min(spanHour, slots)
  spanHour = Math.max(spanHour, 1)
  let span = spanHour + spanMin
  console.log(span)
  return {
    event,
    span,
    left: padding + 1,
    right: Math.max(padding + span, 1),
  }
}

export function eventLevels(rowSegments, limit = Infinity) {
  let i,
    j,
    seg,
    levels = [],
    extra = []

  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i]

    for (j = 0; j < levels.length; j++) if (!segsOverlap(seg, levels[j])) break

    if (j >= limit) {
      extra.push(seg)
    } else {
      ;(levels[j] || (levels[j] = [])).push(seg)
    }
  }

  for (i = 0; i < levels.length; i++) {
    levels[i].sort((a, b) => a.left - b.left) //eslint-disable-line
  }

  return { levels, extra }
}

export function inRange(e, start, end, { startAccessor, endAccessor }) {
  let eStart = dates.startOf(get(e, startAccessor), 'day')
  let eEnd = get(e, endAccessor)

  let startsBeforeEnd = dates.lte(eStart, end, 'day')
  // when the event is zero duration we need to handle a bit differently
  let endsAfterStart = !dates.eq(eStart, eEnd, 'minutes')
    ? dates.gt(eEnd, start, 'minutes')
    : dates.gte(eEnd, start, 'minutes')

  return startsBeforeEnd && endsAfterStart
}

export function segsOverlap(seg, otherSegs) {
  return otherSegs.some(
    otherSeg => otherSeg.left <= seg.right && otherSeg.right >= seg.left
  )
}

export function sortEvents(
  evtA,
  evtB,
  { startAccessor, endAccessor, allDayAccessor }
) {
  let startSort =
    +dates.startOf(get(evtA, startAccessor), 'day') -
    +dates.startOf(get(evtB, startAccessor), 'day')

  let durA = dates.diff(
    get(evtA, startAccessor),
    dates.ceil(get(evtA, endAccessor), 'day'),
    'day'
  )

  let durB = dates.diff(
    get(evtB, startAccessor),
    dates.ceil(get(evtB, endAccessor), 'day'),
    'day'
  )

  return (
    startSort || // sort by start Day first
    Math.max(durB, 1) - Math.max(durA, 1) || // events spanning multiple days go first
    !!get(evtB, allDayAccessor) - !!get(evtA, allDayAccessor) || // then allDay single day events
    +get(evtA, startAccessor) - +get(evtB, startAccessor)
  ) // then sort by start time
}
