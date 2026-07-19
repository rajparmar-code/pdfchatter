import { NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'

export const runtime = 'nodejs'

const MAX_BYTES = 15 * 1024 * 1024 // 15MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file was provided.' }, { status: 400 })
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'PDF is too large. Max size is 15MB.' }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const parser = new PDFParse({ data: buffer })
    let result
    try {
      result = await parser.getText()
    } finally {
      await parser.destroy()
    }

    const text = result.text?.trim()
    if (!text) {
      return NextResponse.json(
        { error: 'No extractable text was found in this PDF. It may be a scanned image without a text layer.' },
        { status: 422 }
      )
    }

    return NextResponse.json({
      filename: file.name,
      text,
      pages: result.total ?? null,
    })
  } catch (error) {
    console.error('extract route error:', error)
    return NextResponse.json({ error: 'Unable to read this PDF.' }, { status: 500 })
  }
}
