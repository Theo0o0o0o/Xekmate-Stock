import React from "react";
import xekmateLogo from '@/assets/xekmate-logo.png';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-white">
      
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={xekmateLogo} alt="XEKmate" className="w-64 max-w-full h-auto object-contain" />
          </div>
          {title && <h1 className="text-3xl font-bold tracking-tight text-[#000000]">{title}</h1>}
          {subtitle && <p className="mt-2 text-[#000000]">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer &&
        <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        }
      </div>
    </div>);

}
