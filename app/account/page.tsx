'use client';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronLeft, User, Mail, ShieldAlert } from 'lucide-react';
import { signOut } from '@/lib/auth/client';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-active active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="page-title">Account</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Profile Card */}
        <div className="rounded-2xl bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold">M N Rehman</h2>
              <p className="flex items-center gap-1.5 text-[14px] text-muted-foreground mt-0.5">
                <Mail size={14} />
                papa ka email yahan aayega
              </p>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="rounded-2xl bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#0F7FFF]" />
            <h3 className="text-[16px] font-bold">System Status</h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-muted-foreground">Demo Mode</span>
              <span className="rounded-full bg-[#E5F2FF] px-2.5 py-0.5 text-[13px] font-semibold text-[#0F7FFF]">
                {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-muted-foreground">AI System</span>
              <span className="rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[13px] font-semibold text-[#137333]">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-muted-foreground">Database</span>
              <span className="rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[13px] font-semibold text-[#137333]">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF1F0] px-4 py-3.5 text-[15px] font-bold text-[#D92D20] transition-colors active:bg-[#FFE3E0]"
          >
            <LogOut size={18} />
            Log Out Karein
          </button>
        </div>
      </div>
    </div>
  );
}
