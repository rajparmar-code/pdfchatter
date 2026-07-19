import './globals.css'
import '../styles.css'
import type { Metadata } from 'next'
export const metadata: Metadata={title:'PDFChatter',description:'Ask your documents anything.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
