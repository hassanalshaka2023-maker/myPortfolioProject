/**
 * Page-enter transition for public routes. Templates remount on navigation, which restarts the
 * CSS animation. CSS (not Motion) so the first paint isn't hidden until hydration.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-enter">{children}</div>;
}
