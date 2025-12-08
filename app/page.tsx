import AuthButton from '@/components/AuthButton';
import SubscriptionList from '@/components/SubscriptionList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            我的订阅管理
          </h1>
          <AuthButton />
        </div>

        <SubscriptionList />
      </div>
    </div>
  );
}
