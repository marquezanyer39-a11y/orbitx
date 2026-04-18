import { Redirect, type Href, usePathname } from 'expo-router';

interface RouteRedirectProps {
  href: string;
}

export function RouteRedirect({ href }: RouteRedirectProps) {
  const pathname = usePathname();

  if (!href || pathname === href) {
    return null;
  }

  return <Redirect href={href as Href} />;
}
