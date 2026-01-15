import './globals.css'

export const metadata = {
  title: 'Care-Pilot - Gestion de soins',
  description: 'Solution de care management conforme HDS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}