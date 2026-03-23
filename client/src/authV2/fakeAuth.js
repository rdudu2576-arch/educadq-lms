// authV2/fakeAuth.js - Módulo de Autenticação Fake
export const fakeAuthLogin = (role = 'aluno') => {
  const profiles = {
    admin: {
      id: 'admin-001',
      name: 'Admin Fictício',
      email: 'admin@educadq.com',
      role: 'admin',
      debugAccess: false,
      permissions: ['manage_courses', 'manage_users', 'manage_payments', 'view_reports']
    },
    professor: {
      id: 'prof-001',
      name: 'Prof. Teste',
      email: 'professor@educadq.com',
      role: 'professor',
      debugAccess: false,
      permissions: ['edit_courses', 'create_lessons', 'create_assessments', 'view_students']
    },
    aluno: {
      id: 'aluno-001',
      name: 'Aluno de Teste',
      email: 'aluno@educadq.com',
      role: 'aluno',
      debugAccess: false,
      permissions: ['view_courses', 'view_lessons', 'take_assessments', 'view_progress']
    },
    desenvolvedor: {
      id: 'dev-001',
      name: 'Dev Superuser',
      email: 'dev@educadq.com',
      role: 'desenvolvedor',
      debugAccess: true,
      permissions: ['*'], // Acesso total
      debugTools: {
        mockDataGenerator: true,
        networkInterceptor: true,
        performanceMonitor: true,
        stateInspector: true
      }
    }
  };

  return profiles[role] || profiles.aluno;
};
