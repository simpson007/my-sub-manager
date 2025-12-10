// supabase/functions/notify-due-subs/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const resend = new Resend(RESEND_API_KEY);
// 注意：这里创建的是这就拥有最高权限的 Admin 客户端
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

Deno.serve(async (_req) => {
  try {
    // 1. 计算 "3天后" 的日期
    // ⚠️ 为了让你立刻测试成功，这里我先改成查询【3天后】
    // ⚠️ 如果你刚才数据库改的是【2025-12-12】，这段代码正好能查到
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const dateStr = targetDate.toISOString().split("T")[0];

    console.log(`🤖 开始扫描到期日期为 ${dateStr} 的订阅...`);

    // 2. 查询数据库 (只查 subscriptions 表，不连表了)
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("due_date", dateStr);

    if (error) {
      console.error("数据库查询出错:", error);
      throw error;
    }

    console.log(`📋 发现 ${subscriptions?.length || 0} 条即将到期的订阅`);

    const results = [];
    if (subscriptions && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        // 3. 【修复点】在这里单独去查用户信息
        if (!sub.user_id) continue;
        
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(sub.user_id);
        
        if (userError || !userData.user) {
          console.error(`无法找到用户 ${sub.user_id} 的信息`);
          continue;
        }

        const userEmail = userData.user.email;
        console.log(`📧 准备给 ${userEmail} 发送关于 ${sub.name} 的提醒...`);

        // 4. 发送邮件
        const { data, error: emailError } = await resend.emails.send({
          // ⚠️ 这里记得改成你自己的发件人，没配置好域名就先用 onboarding@resend.dev
          from: "onboarding@resend.dev", 
          to: [userEmail],
          subject: `[提醒] 您的 ${sub.name} 订阅即将到期`,
          html: `
            <h3>续费提醒 📅</h3>
            <p>您的订阅 <strong>${sub.name}</strong> 将在 3 天后 (${dateStr}) 到期。</p>
            <p>金额：<strong>${sub.price}</strong></p>
            <p>请及时处理。</p>
          `,
        });

        if (emailError) {
          console.error(`❌ 发送失败: ${emailError.message}`);
        } else {
          results.push(data);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: `执行完成，成功发送 ${results.length} 封`, details: results }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});