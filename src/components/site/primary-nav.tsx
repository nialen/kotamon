'use client';

import { CaretDown } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HEADER_NAVIGATION } from '@/content/routes';

export function PrimaryNav() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!openLabel) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) setOpenLabel(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (navRef.current?.contains(document.activeElement)) triggers.current[openLabel]?.focus();
      setOpenLabel(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openLabel]);

  return (
    <nav aria-label="Primary navigation" className="primary-nav" ref={navRef}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenLabel(null); }}>
      <ul className="primary-nav__root">
        {HEADER_NAVIGATION.map((group) => {
          const open = openLabel === group.label;
          const active = pathname === group.href || group.items.some(item => item.href === pathname);
          const id = `desktop-submenu-${group.label.toLowerCase()}`;
          return (
            <li className="primary-nav__group" key={group.href}
              onPointerEnter={(event) => { if (event.pointerType === 'mouse') setOpenLabel(group.items.length ? group.label : null); }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) setOpenLabel(null);
              }}>
              <div className="primary-nav__heading">
                <Link className="primary-nav__section-link"
                  aria-current={pathname === group.href ? 'page' : active ? 'location' : undefined}
                  href={group.href} onClick={() => setOpenLabel(null)}>{group.label}</Link>
                {group.items.length > 0 && (
                  <button className="nav-disclosure" type="button" aria-label={`Toggle ${group.label} submenu`}
                    aria-controls={id} aria-expanded={open}
                    ref={(node) => { triggers.current[group.label] = node; }}
                    onClick={() => setOpenLabel(open ? null : group.label)}>
                    <CaretDown aria-hidden="true" size={16} weight="bold" />
                  </button>
                )}
              </div>
              {group.items.length > 0 && (
                <ul className="primary-nav__dropdown" id={id} hidden={!open}>
                  {group.items.map(item => (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={open && pathname === item.href ? 'page' : undefined}
                        onClick={() => setOpenLabel(null)}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
