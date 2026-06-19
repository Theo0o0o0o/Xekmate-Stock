import React from 'react';
export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
        {description &&
        <p className="text-[12px] text-muted-foreground mt-0.5 hidden">{description}</p>
        }
      </div>
      {actions &&
      <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>
      }
    </div>);

}