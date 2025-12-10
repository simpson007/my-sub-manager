'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function UpgradeButton() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      
      // 检查用户是否已经是 Pro
      if (user?.id) {
        supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setIsPro(data?.is_pro || false);
          });
      }
    });
  }, []);

  const handleCheckout = () => {
    if (!userId) {
      alert('请先登录');
      return;
    }

    const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK;
    if (!paymentLink) {
      alert('支付链接未配置');
      return;
    }
    
    // 把 user_id 拼接到 checkout 链接，Lemon Squeezy 会在 webhook 里原样返回
    const checkoutUrl = `${paymentLink}?checkout[custom][user_id]=${userId}`;
    
    window.open(checkoutUrl, '_blank');
  };

  // 已经是 Pro 用户
  if (isPro) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white font-bold">
        <span>👑</span>
        <span>Pro 会员</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={!userId}
      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      ⚡️ 升级 Pro
    </button>
  );
}
