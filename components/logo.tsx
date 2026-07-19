'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  showText = true,
  logoUrl: initialLogoUrl,
  agencyName = '',
  fallbackSrc = '/logo.jpg',
}: {
  className?: string;
  showText?: boolean;
  logoUrl?: string | null;
  agencyName?: string;
  fallbackSrc?: string;
}) {
  const logoUrl = initialLogoUrl ?? null;
  const displayName = agencyName || 'Twist Studio';
  const firstWord = displayName.split(' ')[0] || 'Twist';
  const rest = displayName.substring(firstWord.length).trimStart();

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/10">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-lg object-contain"
            unoptimized
          />
        ) : (
          <Image
            src={fallbackSrc}
            alt="Fallback logo"
            width={40}
            height={40}
            className="rounded-lg object-contain"
          />
        )}
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-foreground">{firstWord}<span className="text-primary">{rest}</span></span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Creative Agency</span>
        </div>
      )}
    </div>
  );
}
