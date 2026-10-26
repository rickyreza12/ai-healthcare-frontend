import type { GrowthPoint, GrowthSeries } from './pediatricData.ts'

export type ChartDomain = {
  readonly xMin: number
  readonly xMax: number
  readonly yMin: number
  readonly yMax: number
}

/** Maps a supplied value onto a 0-100 axis fraction. Never a clinical calculation. */
export function toPercent(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max === min) return 0
  return ((value - min) / (max - min)) * 100
}

/** Normalized 0-100 coordinates for a chart point, origin top-left. */
export function pointPosition(point: GrowthPoint, domain: ChartDomain): { left: number; top: number } {
  return {
    left: toPercent(point.ageYears, domain.xMin, domain.xMax),
    top: 100 - toPercent(point.value, domain.yMin, domain.yMax),
  }
}

/** SVG polyline points for one fixture series across a shared domain. */
export function toPolylinePoints(points: readonly GrowthPoint[], domain: ChartDomain): string {
  return points
    .map((point) => {
      const { left, top } = pointPosition(point, domain)
      return `${left.toFixed(2)},${top.toFixed(2)}`
    })
    .join(' ')
}

export function isOrderedByAge(points: readonly GrowthPoint[]): boolean {
  return points.every((point, index) => index === 0 || point.ageYears > (points[index - 1]?.ageYears ?? 0))
}

export function findSeries(series: readonly GrowthSeries[], key: string): GrowthSeries | undefined {
  return series.find((entry) => entry.key === key)
}

export function pointsInsideDomain(points: readonly GrowthPoint[], domain: ChartDomain): boolean {
  return points.every(
    (point) =>
      point.ageYears >= domain.xMin &&
      point.ageYears <= domain.xMax &&
      point.value >= domain.yMin &&
      point.value <= domain.yMax,
  )
}
