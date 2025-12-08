'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function SubscriptionCard({id, onDelete}: { id: number; onDelete?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const result = confirm("确定要删除吗？");

    if (!result) return;

    setLoading(true);

    const { error } = await supabase.from('subscriptions').delete().eq('id', id)

    if (error) {
      console.error('Error deleting subscription:', error);
      toast.error('删除失败，请重试');
    } else {
      toast.success('删除成功');  
      onDelete?.(); // 调用回调刷新列表
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => handleDelete()}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg 
        text-white hover:shadow-purple-500/25"
      >
        - 删除订阅
      </button>
    </>
  );
}
