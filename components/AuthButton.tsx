'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { signInWithGitHub, signOut } from '@/utils/supabase/auth';
import type { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null); // null = loading
  const [loading, setLoading] = useState(true);

  // 获取用户的 Pro 状态
  const fetchProStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('获取 Pro 状态失败:', error);
    }
    console.log('Pro 状态查询结果:', { userId, data, error });
    
    setIsPro(data?.is_pro ?? false);
  };

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchProStatus(user.id);
      }
      setLoading(false);
    });

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProStatus(session.user.id);
        } else {
          setIsPro(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 升级按钮点击
  const handleUpgrade = () => {
    if (!user) return;
    
    const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK;
    if (!paymentLink) {
      alert('支付链接未配置');
      return;
    }
    
    const checkoutUrl = `${paymentLink}?checkout[custom][user_id]=${user.id}`;
    window.open(checkoutUrl, '_blank');
  };

  if (loading) {
    return <div className="text-gray-400">加载中...</div>;
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const userName = user.user_metadata?.user_name || user.email;
    
    return (
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <div className="relative">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={userName} 
              className={`w-10 h-10 rounded-full border-2 ${isPro ? 'border-yellow-500' : 'border-purple-500'}`}
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isPro ? 'bg-yellow-500' : 'bg-purple-500'}`}>
              {userName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* 用户名 + Pro 徽章 */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-gray-300">{userName}</span>
          {isPro && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded">
              PRO
            </span>
          )}
        </div>

        {/* 升级按钮 (仅非 Pro 用户显示) */}
        {isPro === false && (
          <button
            onClick={handleUpgrade}
            className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            ⚡️ 升级
          </button>
        )}

        {/* 登出按钮 */}
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors text-sm"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signInWithGitHub()}
      className="px-6 py-3 bg-gray-800 border border-gray-600 rounded-lg font-medium hover:bg-gray-700 transition-all flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
      使用 GitHub 登录
    </button>
  );
}
