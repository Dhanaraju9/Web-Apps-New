import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ---------------------------------------------------------------------------
// 1. User Profiles & Role Synchronization
// ---------------------------------------------------------------------------
export async function syncUserProfileToSupabase(user: any, additionalData: Record<string, any> = {}) {
  if (!user || (!user.id && !user.uid)) return null;
  const userId = user.id || user.uid;
  const isAuthorizedAdmin = Boolean(
    user.email && String(user.email).toLowerCase() === 'sobhadhanaraju0@gmail.com'
  );

  const payload = {
    id: userId,
    uid: userId,
    email: user.email || additionalData.email || '',
    phone_number: user.phone || user.phoneNumber || additionalData.phoneNumber || '',
    display_name: user.user_metadata?.full_name || user.displayName || additionalData.displayName || '',
    role: isAuthorizedAdmin ? 'admin' : 'student',
    is_premium: isAuthorizedAdmin ? true : false,
    last_login_at: new Date().toISOString(),
    ...additionalData,
  };

  if (!isSupabaseConfigured) {
    localStorage.setItem(`aspirant_supabase_user_${userId}`, JSON.stringify(payload));
    return payload;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Notice syncing user profile to Supabase:', error.message);
      localStorage.setItem(`aspirant_supabase_user_${userId}`, JSON.stringify(payload));
      return payload;
    }
    return data;
  } catch (err) {
    console.warn('Supabase profile sync exception:', err);
    return payload;
  }
}

export async function getUserProfileFromSupabase(userId: string) {
  if (!isSupabaseConfigured) {
    const cached = localStorage.getItem(`aspirant_supabase_user_${userId}`);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      const cached = localStorage.getItem(`aspirant_supabase_user_${userId}`);
      return cached ? JSON.parse(cached) : null;
    }
    return data;
  } catch (err) {
    console.warn('Notice fetching user profile from Supabase:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 2. Questions / MCQs Cloud Persistence
// ---------------------------------------------------------------------------
export async function fetchQuestionsFromSupabase(filter?: {
  appId?: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  subtopic?: string;
}) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from('questions').select('*');

    if (filter?.appId) query = query.eq('app_id', filter.appId);
    if (filter?.subjectId) query = query.eq('subject_id', filter.subjectId);
    if (filter?.unitId) query = query.eq('unit_id', filter.unitId);
    if (filter?.topicId) query = query.eq('topic_id', filter.topicId);
    if (filter?.subtopic) query = query.ilike('subtopic', filter.subtopic);

    const { data, error } = await query;
    if (error) {
      console.warn('Notice fetching MCQs from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase question query exception:', err);
    return [];
  }
}

export async function bulkUploadQuestionsToSupabase(questions: any[]) {
  if (!isSupabaseConfigured || !questions.length) return true;

  try {
    const records = questions.map((q) => ({
      id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      app_id: q.appId || 'all',
      subject_id: q.subjectId || '',
      unit_id: q.unitId || '',
      topic_id: q.topicId || '',
      subtopic: q.subtopic || 'General Practice',
      question: q.question || '',
      question_telugu: q.questionTelugu || null,
      options: q.options || [],
      options_telugu: q.optionsTelugu || null,
      correct_option: Number(q.correctOption ?? q.correctIndex ?? 0),
      explanation: q.explanation || null,
      explanation_telugu: q.explanationTelugu || null,
      difficulty: q.difficulty || 'medium',
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('questions').upsert(records, { onConflict: 'id' });
    if (error) {
      console.warn('Notice bulk inserting questions to Supabase:', error.message);
    }
    return true;
  } catch (err) {
    console.warn('Supabase question bulk upload exception:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// 3. Current Affairs Compendiums
// ---------------------------------------------------------------------------
export async function fetchCurrentAffairsFromSupabase(appId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from('current_affairs').select('*').order('published_date', { ascending: false });
    if (appId) {
      query = query.or(`app_id.eq.${appId},app_id.eq.all`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Notice fetching current affairs from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase current affairs exception:', err);
    return [];
  }
}

export async function saveCurrentAffairToSupabase(item: {
  appId: string;
  month: string;
  title: string;
  content: string;
  publishedDate: string;
}) {
  const docId = `ca_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const record = {
    id: docId,
    app_id: item.appId || 'all',
    month: item.month,
    title: item.title,
    content: item.content,
    published_date: item.publishedDate || new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return docId;

  try {
    const { error } = await supabase.from('current_affairs').insert([record]);
    if (error) {
      console.warn('Notice saving current affair to Supabase:', error.message);
    }
    return docId;
  } catch (err) {
    console.warn('Supabase current affair insert exception:', err);
    return docId;
  }
}

// ---------------------------------------------------------------------------
// 4. Mock Tests & Test Attempts
// ---------------------------------------------------------------------------
export async function fetchMockTestsFromSupabase(appId?: string, userId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase.from('mock_tests').select('*');
    if (error) {
      console.warn('Notice fetching mock tests from Supabase:', error.message);
      return [];
    }

    return (data || []).filter((test: any) => {
      if (appId && test.app_id && test.app_id !== appId && test.app_id !== 'all') return false;
      if (test.is_official || test.status === 'published') return true;
      if (userId && test.creator_user_id === userId) return true;
      return false;
    });
  } catch (err) {
    console.warn('Supabase mock test query exception:', err);
    return [];
  }
}

export async function saveMockTestToSupabase(mockTest: any) {
  const docId = mockTest.id || `mt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const record = {
    id: docId,
    app_id: mockTest.appId || 'all',
    title: mockTest.title,
    description: mockTest.description || '',
    duration_minutes: Number(mockTest.durationMinutes || 60),
    total_questions: Number(mockTest.totalQuestions || 50),
    questions: mockTest.questions || [],
    is_official: Boolean(mockTest.isOfficial),
    creator_user_id: mockTest.creatorUserId || null,
    status: mockTest.status || 'published',
    created_at: mockTest.createdAt || new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('mock_tests').upsert(record, { onConflict: 'id' });
    return record;
  } catch (err) {
    console.warn('Supabase mock test save exception:', err);
    return record;
  }
}

// ---------------------------------------------------------------------------
// 5. Bookmarks & Saved Drills
// ---------------------------------------------------------------------------
export async function fetchBookmarksFromSupabase(userId: string, appId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from('bookmarks').select('*').eq('user_id', userId);
    if (appId) {
      query = query.or(`app_id.eq.${appId},app_id.eq.all`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Notice fetching bookmarks from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase bookmark query exception:', err);
    return [];
  }
}

export async function saveBookmarkToSupabase(bookmark: any) {
  const docId = bookmark.id || `${bookmark.userId}_${bookmark.itemType}_${bookmark.itemId}`;
  const record = {
    id: docId,
    user_id: bookmark.userId,
    app_id: bookmark.appId || 'all',
    item_type: bookmark.itemType || 'question',
    item_id: bookmark.itemId,
    title: bookmark.title || '',
    content: bookmark.content || {},
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('bookmarks').upsert(record, { onConflict: 'id' });
    return record;
  } catch (err) {
    console.warn('Supabase bookmark save exception:', err);
    return record;
  }
}

export async function deleteBookmarkFromSupabase(id: string) {
  if (!isSupabaseConfigured) return true;

  try {
    await supabase.from('bookmarks').delete().eq('id', id);
    return true;
  } catch (err) {
    console.warn('Supabase bookmark delete exception:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// 6. Purchases & Subscription Validation
// ---------------------------------------------------------------------------
export async function recordPurchaseInSupabase(purchase: Record<string, any>) {
  const purchaseId = purchase.orderId || purchase.id || `pur_${Date.now()}`;
  const record = {
    id: purchaseId,
    user_id: purchase.userId || null,
    order_id: purchase.orderId || purchase.razorpay_order_id || purchaseId,
    payment_id: purchase.paymentId || purchase.razorpay_payment_id || null,
    plan_id: purchase.planId || 'sub-1',
    plan_name: purchase.planName || '1 Month Starter',
    amount: Number(purchase.amount || purchase.amountSubunits / 100 || 199),
    currency: purchase.currency || 'INR',
    status: purchase.status || 'completed',
    created_at: purchase.createdAt || new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return purchaseId;

  try {
    await supabase.from('purchases').upsert(record, { onConflict: 'id' });
    return purchaseId;
  } catch (err) {
    console.warn('Supabase purchase record exception:', err);
    return purchaseId;
  }
}

export async function fetchUserPurchasesFromSupabase(userId: string) {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice fetching purchases from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase purchase query exception:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 7. Exam Apps & Syllabus Management
// ---------------------------------------------------------------------------
export async function syncAppToSupabase(appData: any) {
  if (!appData || !appData.id) return null;
  const record = {
    id: appData.id,
    name: appData.name || '',
    package_name: appData.packageName || '',
    icon: appData.icon || '',
    state: appData.state || '',
    syllabus: appData.syllabus || [],
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('apps').upsert(record, { onConflict: 'id' });
    return record;
  } catch (err) {
    console.warn('Notice syncing app to Supabase:', err);
    return record;
  }
}

export async function fetchAppsFromSupabase() {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase.from('apps').select('*');
    if (error) {
      console.warn('Notice fetching apps from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase apps query exception:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 8. Posters, Banners & Home Promotions
// ---------------------------------------------------------------------------
export async function savePosterToSupabase(poster: any) {
  const docId = poster.id || `poster_${Date.now()}`;
  const record = {
    id: docId,
    app_ids: poster.appIds || ['all'],
    title: poster.title || '',
    subtitle: poster.subtitle || '',
    badge: poster.badge || '',
    image_url: poster.imageUrl || '',
    target_type: poster.targetType || 'prelims',
    cta_text: poster.ctaText || '',
    position: poster.position || 'home-banner',
    status: poster.status || 'active',
    start_date: poster.startDate || new Date().toISOString(),
    end_date: poster.endDate || '',
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('posters').upsert(record, { onConflict: 'id' });
    return record;
  } catch (err) {
    console.warn('Notice saving poster to Supabase:', err);
    return record;
  }
}

export async function fetchPostersFromSupabase(appId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase.from('posters').select('*').eq('status', 'active');
    if (error) {
      console.warn('Notice fetching posters from Supabase:', error.message);
      return [];
    }
    if (!appId) return data || [];
    return (data || []).filter((p: any) => {
      const appIds = p.app_ids || p.appIds || [];
      return appIds.includes('all') || appIds.includes(appId);
    });
  } catch (err) {
    console.warn('Supabase posters query exception:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 9. Mock Test Attempts & Progress Analytics
// ---------------------------------------------------------------------------
export async function saveMockTestAttemptToSupabase(attempt: any) {
  const docId = attempt.id || `mta_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const record = {
    id: docId,
    test_id: attempt.testId,
    user_id: attempt.userId,
    app_id: attempt.appId || 'all',
    score: Number(attempt.score || 0),
    total_marks: Number(attempt.totalMarks || 100),
    percentage: Number(attempt.percentage || 0),
    accuracy: Number(attempt.accuracy || 0),
    time_spent_seconds: Number(attempt.timeSpentSeconds || 0),
    user_answers: attempt.userAnswers || {},
    completed_at: attempt.completedAt || new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('mock_test_attempts').upsert(record, { onConflict: 'id' });
    return record;
  } catch (err) {
    console.warn('Notice saving test attempt to Supabase:', err);
    return record;
  }
}

export async function fetchMockTestAttemptsFromSupabase(userId?: string, appId?: string) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from('mock_test_attempts').select('*');
    if (userId) query = query.eq('user_id', userId);
    if (appId) query = query.or(`app_id.eq.${appId},app_id.eq.all`);

    const { data, error } = await query;
    if (error) {
      console.warn('Notice fetching test attempts from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase test attempts query exception:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 10. Admin Audit Logging
// ---------------------------------------------------------------------------
export async function recordAuditLogToSupabase(log: any) {
  const docId = log.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const record = {
    id: docId,
    admin_email: log.adminEmail || '',
    action: log.action || '',
    target_id: log.targetId || '',
    target_type: log.targetType || 'app',
    details: log.details || '',
    timestamp: log.timestamp || new Date().toISOString(),
  };

  if (!isSupabaseConfigured) return record;

  try {
    await supabase.from('audit_logs').insert([record]);
    return record;
  } catch (err) {
    console.warn('Notice saving audit log to Supabase:', err);
    return record;
  }
}

export async function fetchAuditLogsFromSupabase() {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(150);
    if (error) {
      console.warn('Notice fetching audit logs from Supabase:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase audit logs query exception:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 11. Login Carousel Transitions Configuration Management
// ---------------------------------------------------------------------------
import { LoginCarouselConfig, DEFAULT_CAROUSEL_CONFIG, resolveCarouselConfig } from '../lib/carouselTransitions';

const CAROUSEL_CONFIGS_STORAGE_KEY = 'aspirant_carousel_configs';

export async function fetchLoginCarouselConfigsFromSupabase(): Promise<LoginCarouselConfig[]> {
  const cached = localStorage.getItem(CAROUSEL_CONFIGS_STORAGE_KEY);
  let localList: LoginCarouselConfig[] = [];
  if (cached) {
    try {
      localList = JSON.parse(cached);
    } catch (e) {}
  }
  if (!localList || localList.length === 0) {
    localList = [DEFAULT_CAROUSEL_CONFIG];
  } else {
    // Ensure the baseline default item uses FADE
    const defIdx = localList.findIndex(c => c.id === DEFAULT_CAROUSEL_CONFIG.id);
    if (defIdx >= 0) {
      localList[defIdx] = {
        ...localList[defIdx],
        transition_style: DEFAULT_CAROUSEL_CONFIG.transition_style,
        transition_duration: DEFAULT_CAROUSEL_CONFIG.transition_duration
      };
    }
  }

  if (!isSupabaseConfigured) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from('login_carousel_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return localList;
    }

    const formatted: LoginCarouselConfig[] = data.map((row: any) => ({
      id: row.id,
      scope_type: row.scope_type,
      app_ids: Array.isArray(row.app_ids) ? row.app_ids : (typeof row.app_ids === 'string' ? JSON.parse(row.app_ids) : []),
      transition_style: row.transition_style,
      transition_duration: Number(row.transition_duration) || 600,
      speed_preset: row.speed_preset || 'normal',
      autoplay_enabled: Boolean(row.autoplay_enabled),
      autoplay_interval: Number(row.autoplay_interval) || 4500,
      transition_direction: row.transition_direction || 'left',
      infinite_loop: row.infinite_loop !== false,
      pause_on_interaction: row.pause_on_interaction !== false,
      reduce_motion_support: row.reduce_motion_support !== false,
      is_active: row.is_active !== false,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    localStorage.setItem(CAROUSEL_CONFIGS_STORAGE_KEY, JSON.stringify(formatted));
    return formatted;
  } catch (err) {
    console.warn('Notice querying Supabase carousel configs:', err);
    return localList;
  }
}

function toValidUuid(val?: string): string {
  if (val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)) {
    return val;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function saveLoginCarouselConfigToSupabase(
  config: LoginCarouselConfig
): Promise<LoginCarouselConfig> {
  const id = toValidUuid(config.id);
  const now = new Date().toISOString();

  const formattedConfig: LoginCarouselConfig = {
    ...config,
    id,
    created_at: config.created_at || now,
    updated_at: now
  };

  // Update local storage cache immediately
  try {
    const cached = localStorage.getItem(CAROUSEL_CONFIGS_STORAGE_KEY);
    let list: LoginCarouselConfig[] = cached ? JSON.parse(cached) : [];
    const existingIdx = list.findIndex(c => c.id === id);
    if (existingIdx >= 0) {
      list[existingIdx] = formattedConfig;
    } else {
      list.unshift(formattedConfig);
    }
    localStorage.setItem(CAROUSEL_CONFIGS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  // Dispatch runtime event for instant synchronized updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aspirant_carousel_config_updated', { detail: formattedConfig })
    );
  }

  if (!isSupabaseConfigured) {
    return formattedConfig;
  }

  try {
    const payload = {
      id: formattedConfig.id,
      scope_type: formattedConfig.scope_type,
      app_ids: formattedConfig.app_ids,
      transition_style: formattedConfig.transition_style,
      transition_duration: formattedConfig.transition_duration,
      autoplay_enabled: formattedConfig.autoplay_enabled,
      autoplay_interval: formattedConfig.autoplay_interval,
      transition_direction: formattedConfig.transition_direction,
      infinite_loop: formattedConfig.infinite_loop,
      is_active: formattedConfig.is_active,
      created_at: formattedConfig.created_at,
      updated_at: formattedConfig.updated_at
    };

    const { data: _data, error } = await supabase
      .from('login_carousel_configs')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Notice saving carousel config to Supabase:', error.message);
      return formattedConfig;
    }

    return formattedConfig;
  } catch (err) {
    console.warn('Exception saving carousel config to Supabase:', err);
    return formattedConfig;
  }
}

export async function deleteLoginCarouselConfigFromSupabase(id: string): Promise<boolean> {
  // Update local storage
  try {
    const cached = localStorage.getItem(CAROUSEL_CONFIGS_STORAGE_KEY);
    if (cached) {
      const list: LoginCarouselConfig[] = JSON.parse(cached);
      const filtered = list.filter(c => c.id !== id);
      localStorage.setItem(CAROUSEL_CONFIGS_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aspirant_carousel_config_deleted', { detail: { id } })
    );
  }

  if (!isSupabaseConfigured) {
    return true;
  }

  try {
    await supabase.from('login_carousel_configs').delete().eq('id', id);
    return true;
  } catch (err) {
    console.warn('Notice deleting carousel config from Supabase:', err);
    return true;
  }
}

export function getResolvedCarouselConfig(
  appId: string,
  configs?: LoginCarouselConfig[]
): LoginCarouselConfig {
  let list = configs;
  if (!list) {
    const cached = localStorage.getItem(CAROUSEL_CONFIGS_STORAGE_KEY);
    if (cached) {
      try {
        list = JSON.parse(cached);
      } catch (e) {}
    }
  }
  return resolveCarouselConfig(appId, list || []);
}

