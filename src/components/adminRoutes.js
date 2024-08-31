import Competitions from './admin/Competitions';
import UserManagement from './admin/UserManagement';
import Analytics from './admin/Analytics';
import ContentModeration from './admin/ContentModeration';
import Notifications from './admin/Notifications';
import Settings from './admin/Settings';
import SecurityLogs from './admin/SecurityLogs';

const adminRoutes = [
  { path: '/admin/competitions', name: 'Competitions', component: Competitions },
  { path: '/admin/users', name: 'User Management', component: UserManagement },
  { path: '/admin/analytics', name: 'Analytics', component: Analytics },
  { path: '/admin/content-moderation', name: 'Content Moderation', component: ContentModeration },
  { path: '/admin/notifications', name: 'Notifications', component: Notifications },
  { path: '/admin/settings', name: 'Settings', component: Settings },
  { path: '/admin/security', name: 'Security & Logs', component: SecurityLogs },
];

export default adminRoutes;
