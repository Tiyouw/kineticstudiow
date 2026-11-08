// the green mascot tells the Studio apart from the site (blue) in the browser's tabs
export const metadata = {
  title: "Kinetic Studiow · Studio",
  robots: { index: false, follow: false },
  icons: { icon: "/assets/studio-icon-64.png", apple: "/assets/studio-icon-192.png" },
};

/** The Studio has its own root layout: none of the site's chrome. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
