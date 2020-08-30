/**
 * Clean up tozanJoho data from CMS
 * @param {*} data 
 */
function tozanJoho(data) {
  const allEntries = data.tozanJoho.entries
    .map(parseDate)
    .sort(byDate)
    .reduce(groupByTrail, {
      summit: [],
      nakadake: [],
      tennyogahara: [],
      uraasahi: []
    })

  return allEntries 
}

/**
 * Convert date to date object and generate `○月○旬` string
 * @param {object} entry - Tozanjoho entry
 */
function parseDate(entry) {
  const date = new Date(entry.date)
  
  const month = date.getMonth() + 1
  const day = date.getDate()

  const jun = day < 11 ?
    '初旬' :
    day < 21 ?
      '中旬' :
      '下旬'

  const displayDate = `${month}月${jun}`

  return {
    ...entry,
    date,
    displayDate
  }
}

/**
 * Sort entries by date
 * @param {*} a
 * @param {*} b
 */
function byDate(a,b) {
  return b.date - a.date
}

/**
 * Group entry array by trail name
 * @param {*} groups 
 * @param {*} entry 
 */
function groupByTrail(groups, entry) {
  const trail = getTrailName(entry.trail)

  if (Array.isArray(groups[trail])) {
    groups[trail].push(entry)
  } else {
    groups[trail] = [entry]
  }

  return groups
}

/**
 * Convert cms trail name to object key friendly format
 * @param {*} input 
 */
function getTrailName(input) {
  switch (input) {
    case "旭岳山頂":
      return 'summit'
    case "裾合平・中岳温泉":
      return 'nakadake'
    case "天女が原":
      return'tennyogahara'
    case "裏旭野営場":
      return 'uraasahi'
    default:
      return input
  }
}

module.exports = {
  tozanJoho
}