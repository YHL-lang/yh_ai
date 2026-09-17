import Link from "next/link";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard/settings">) {
  return (
    <div>
      <nav>
        <ul>
          <li><Link href="/dashboard/settings">Settings</Link></li>
        </ul>
      </nav>
      {children}
    </div>
  );
}