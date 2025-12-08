'use client';

import { supabase } from './client';

// GitHub 登录
export async function signInWithGitHub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
    },
  });
  
  if (error) {
    console.error('登录失败:', error);
  }
}

// 登出
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('登出失败:', error);
  }
}

// 获取当前用户
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
