import { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  children: ReactNode;
  level?: 2 | 3;
  id?: string;
};

export function SectionHeading({ eyebrow, children, level = 2, id }: Props) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <header className="flex flex-col gap-2 mb-8">
      {eyebrow && (
        <p className="text-sm uppercase tracking-widest text-ochre font-medium">{eyebrow}</p>
      )}
      <Tag id={id} className="text-3xl sm:text-4xl font-display leading-tight">
        {children}
      </Tag>
    </header>
  );
}
