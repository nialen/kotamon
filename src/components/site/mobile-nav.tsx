'use client';

import { CaretDown, List, X } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { HeaderNavigationGroup } from '@/content/routes';

type MobileNavProps = {
  readonly groups: readonly HeaderNavigationGroup[];
  readonly onOpenChange?: (open: boolean) => void;
};

export function MobileNav({ groups, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(() =>
    groups.find(group => group.href === pathname || group.items.some(item => item.href === pathname))?.label ?? null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const changeOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  }, [onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      changeOpen(false);
      triggerRef.current?.focus();
    }
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) changeOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, changeOpen]);

  return (
    <div className="mobile-nav" ref={containerRef}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) changeOpen(false); }}>
      <button aria-controls="mobile-navigation-panel" aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        className="icon-button mobile-nav__trigger" onClick={() => changeOpen(!isOpen)}
        ref={triggerRef} type="button">
        {isOpen ? <X aria-hidden="true" size={22} weight="bold" /> : <List aria-hidden="true" size={22} weight="bold" />}
      </button>
      <div className="mobile-nav__panel" hidden={!isOpen} id="mobile-navigation-panel">
        <nav aria-label="Mobile navigation">
          {groups.map(group => {
            const open = expanded === group.label;
            const id = `mobile-submenu-${group.label.toLowerCase()}`;
            const hasCurrentChild = group.items.some(item => item.href === pathname);
            return (
              <section className="mobile-nav__group" key={group.label}>
                <div className="mobile-nav__heading">
                  <h2><Link href={group.href}
                    aria-current={pathname === group.href && (!hasCurrentChild || !open) ? 'page' : undefined}
                    onClick={() => changeOpen(false)}>{group.label}</Link></h2>
                  {group.items.length > 0 && (
                    <button className="nav-disclosure" type="button" aria-label={`Toggle ${group.label} submenu`}
                      aria-controls={id} aria-expanded={open} onClick={() => setExpanded(open ? null : group.label)}>
                      <CaretDown aria-hidden="true" size={18} weight="bold" />
                    </button>
                  )}
                </div>
                {group.items.length > 0 && (
                  <ul hidden={!open} id={id}>
                    {group.items.map(item => (
                      <li key={item.href}><Link aria-current={open && pathname === item.href ? 'page' : undefined}
                        href={item.href} onClick={() => changeOpen(false)}>{item.label}</Link></li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
