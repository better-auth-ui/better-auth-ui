import { encode } from "uqr"

export type QrCodeSvgData = {
  /** A path composed only from the encoded QR module coordinates. */
  path: string
  /** The width and height of the square SVG view box. */
  size: number
}

const createModulePath = (modules: boolean[][]) => {
  const commands: string[] = []

  for (const [rowIndex, row] of modules.entries()) {
    let runStart: number | undefined

    for (let columnIndex = 0; columnIndex <= row.length; columnIndex += 1) {
      const isFilled = row[columnIndex] ?? false

      if (isFilled && runStart === undefined) {
        runStart = columnIndex
        continue
      }

      if (!isFilled && runStart !== undefined) {
        commands.push(
          `M${runStart} ${rowIndex}h${columnIndex - runStart}v1H${runStart}z`
        )
        runStart = undefined
      }
    }
  }

  return commands.join("")
}

/**
 * Encode a value into safe path data for an inline SVG QR code.
 *
 * The input is converted to a boolean matrix before the SVG path is built, so
 * the original value can never become markup or an SVG attribute. Generation
 * stays local and synchronous. The four-module border preserves the quiet zone
 * that phone cameras need for reliable scanning.
 *
 * @param value - The text or URL to encode.
 * @returns SVG view-box dimensions and a path for the dark modules.
 */
export function createQrCodeSvgData(value: string): QrCodeSvgData {
  const qrCode = encode(value, {
    border: 4,
    ecc: "M"
  })

  return {
    path: createModulePath(qrCode.data),
    size: qrCode.size
  }
}
