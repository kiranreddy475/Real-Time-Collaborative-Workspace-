import "../src/index.css";
import "../src/workspace.css";

export const metadata = {
  title: "CollabSpace — Work better, together",
  description: "A real-time collaborative workspace powered by Yjs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
