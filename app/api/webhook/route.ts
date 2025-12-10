import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. 获取内容和签名
    const body = await request.text();
    const headersList = await headers();
    const sigString = headersList.get('x-signature');
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

    if (!sigString || !secret) {
      return new Response('Missing signature', { status: 400 });
    }

    // 2. 验证签名 (这是为了防止有人伪造充值请求)
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(body).digest('hex'), 'utf8');
    const signature = Buffer.from(sigString, 'utf8');

    if (!crypto.timingSafeEqual(digest, signature)) {
      return new Response('Invalid signature', { status: 403 });
    }

    // 3. 解析数据
    const payload = JSON.parse(body);
    const eventName = payload.meta.event_name;
    
    // 我们只关心 "order_created" (订单创建成功)
    if (eventName === 'order_created') {
      const customData = payload.meta.custom_data;
      // 拿到前端传过来的 user_id
      const userId = customData?.user_id;

      if (userId) {
        console.log(`💰 用户 ${userId} 充值成功！正在开通权益...`);
        
        // 4. 操作 Supabase 数据库 (需要 Service Role Key 才有权限改 profiles)
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! // 注意：这里要用 Service Role
        );

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ is_pro: true })
          .eq('id', userId);
          
        if (error) {
          console.error('权益开通失败:', error);
          return new Response('Database error', { status: 500 });
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Server error', { status: 500 });
  }
}