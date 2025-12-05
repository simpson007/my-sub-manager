import { supabase } from '@/utils/supabase/client';
import AddSubscription from '@/components/AddSubscription';

interface Subscription {
  id: number;
  name: string;
  price: string;
  due_date: string;
}

async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*');

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const subscriptions = await getSubscriptions();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          我的订阅管理
        </h1>

        <div className="flex justify-center mb-10">
          <AddSubscription />
        </div>

        {subscriptions.length === 0 ? (
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
