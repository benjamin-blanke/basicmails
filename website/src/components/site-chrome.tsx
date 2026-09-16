'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
 const demo=usePathname().startsWith('/demo');
 return <>{!demo&&header}<main id="main">{children}</main>{!demo&&footer}</>;
}
