'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import SubscriptionCard from './SubscriptionCard';
import AddSubscription from './AddSubscription';

interface Subscription {
  id: number;
  name: string;
  price: string;
  due_date: string;
}

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*');

    if (error) {
      console.error('Error fetching subscriptions:', error);
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();

    // 监听登录状态变化，重新获取数据
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscriptions();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <div className="flex justify-center mb-10">
        <AddSubscription onAdd={fetchSubscriptions} />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">加载中...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl">暂无订阅</p>
        </div>
      ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((sub) => (
        <div
          key={sub.id}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <h3 className="text-xl font-semibold mb-3 text-white">{sub.name}</h3>
          <div className="space-y-2 text-gray-400">
            <p className="flex justify-between">
              <span>价格</span>
              <span className="text-purple-400 font-medium">{sub.price}</span>
            </p>
            <p className="flex justify-between">
              <span>到期时间</span>
              <span className="text-pink-400">{sub.due_date}</span>
            </p>
            <div className="flex justify-center mb-10">
              <SubscriptionCard id={sub.id} onDelete={fetchSubscriptions} />
            </div>
          </div>
        </div>
      ))}
    </div>
      )}
    </>
  );
}
