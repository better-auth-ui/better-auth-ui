import { describe, expect, it } from "vitest"
import { createQrCodeSvgData } from "../src/lib/qr-code"

describe("createQrCodeSvgData", () => {
  it("creates deterministic path data without preserving the encoded value", () => {
    const gmailUrl = "https://mail.google.com/mail/"
    const qrCode = createQrCodeSvgData(gmailUrl)

    expect(qrCode.size).toBeGreaterThan(21)
    expect(qrCode.path).toMatch(/^(?:M\d+ \d+h\d+v1H\d+z)+$/)
    expect(qrCode.path).not.toContain(gmailUrl)
    expect(createQrCodeSvgData(gmailUrl)).toEqual(qrCode)
    expect(createQrCodeSvgData("https://outlook.live.com/mail/")).not.toEqual(
      qrCode
    )
  })

  it("reduces markup-like input to numeric module coordinates", () => {
    const unsafeValue =
      'https://mail.example/?next=<script src="https://evil.example"></script>'
    const qrCode = createQrCodeSvgData(unsafeValue)

    expect(qrCode.path).toMatch(/^(?:M\d+ \d+h\d+v1H\d+z)+$/)
    expect(qrCode.path).not.toContain("<")
    expect(qrCode.path).not.toContain("script")
    expect(qrCode.path).not.toContain("evil.example")
  })
})
