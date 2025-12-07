export const metadata = {
  title: 'Recipe Unifier Backend API',
  description: 'AI-powered recipe parser and unifier',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
