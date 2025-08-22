export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'mentesegura-backend',
    },
  },
  realtime: {
    log_level: 'error' as const, // Apenas erros
  },
};

// Configurações de logging baseadas no ambiente
export const getLogLevel = (): 'error' | 'warn' => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return 'error';
  }
  
  // Em desenvolvimento, permitir apenas warnings e erros
  return 'warn';
};
