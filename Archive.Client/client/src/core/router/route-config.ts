import { defaultCatalogKey } from '../../features/nomenclatures/catalogConfig'
import type { CurrentUser } from '../../shared/types/models'

type AppRouteMeta = {
  key: string
  title: string
  icon: string
  requiredPermissions?: string[]
  navigation?: {
    to: string
    label: string
    icon: string
  }
  matches: (pathname: string) => boolean
}

type NavigationItem = {
  key: string
  to: string
  label: string
  icon: string
  requiredPermissions?: string[]
}

const matchesExact = (pathname: string, expected: string) => pathname === expected
const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)
const normalizePathname = (pathname: string) => pathname.split(/[?#]/, 1)[0] ?? pathname

const appRouteMeta: AppRouteMeta[] = [
  {
    key: 'forbidden',
    title: 'Acces interzis',
    icon: 'material-symbols:lock-outline-rounded',
    matches: (pathname) => matchesExact(pathname, '/forbidden'),
  },
  {
    key: 'student-details',
    title: 'Detalii student',
    icon: 'material-symbols:contact-page-rounded',
    requiredPermissions: ['students.view'],
    matches: (pathname) => pathname.startsWith('/students/'),
  },
  {
    key: 'dashboard',
    title: 'Panou',
    icon: 'material-symbols:space-dashboard-rounded',
    requiredPermissions: ['dashboard.view'],
    navigation: {
      to: '/dashboard',
      label: 'Panou',
      icon: 'material-symbols:space-dashboard-rounded',
    },
    matches: (pathname) => matchesExact(pathname, '/dashboard'),
  },
  {
    key: 'students',
    title: 'Studenți',
    icon: 'material-symbols:school-rounded',
    requiredPermissions: ['students.view'],
    navigation: {
      to: '/students',
      label: 'Studenți',
      icon: 'material-symbols:school-rounded',
    },
    matches: (pathname) => matchesExact(pathname, '/students'),
  },
  {
    key: 'documents',
    title: 'Documente',
    icon: 'material-symbols:description-rounded',
    requiredPermissions: ['documents.view'],
    navigation: {
      to: '/documents',
      label: 'Documente',
      icon: 'material-symbols:description-rounded',
    },
    matches: (pathname) => matchesExact(pathname, '/documents'),
  },
  {
    key: 'nomenclatures',
    title: 'Nomenclatoare',
    icon: 'material-symbols:menu-book-rounded',
    requiredPermissions: ['nomenclatures.view'],
    navigation: {
      to: '/nomenclatures',
      label: 'Nomenclatoare',
      icon: 'material-symbols:menu-book-rounded',
    },
    matches: (pathname) => matchesPrefix(pathname, '/nomenclatures'),
  },
  {
    key: 'users',
    title: 'Utilizatori',
    icon: 'material-symbols:manage-accounts-rounded',
    requiredPermissions: ['users.view'],
    navigation: {
      to: '/users',
      label: 'Utilizatori',
      icon: 'material-symbols:manage-accounts-rounded',
    },
    matches: (pathname) => matchesExact(pathname, '/users'),
  },
  {
    key: 'roles',
    title: 'Roluri',
    icon: 'material-symbols:security-rounded',
    requiredPermissions: ['roles.view'],
    navigation: {
      to: '/roles',
      label: 'Roluri',
      icon: 'material-symbols:security-rounded',
    },
    matches: (pathname) => matchesExact(pathname, '/roles'),
  },
  {
    key: 'audit',
    title: 'Audit',
    icon: 'material-symbols:history-rounded',
    requiredPermissions: ['audit.view'],
    navigation: {
      to: '/audit',
      label: 'Audit',
      icon: 'material-symbols:history-rounded',
    },
    matches: (pathname) => matchesExact(pathname, '/audit'),
  },
]

const navigationItems: NavigationItem[] = appRouteMeta.flatMap((route) =>
  route.navigation
    ? [
        {
          key: route.key,
          requiredPermissions: route.requiredPermissions,
          ...route.navigation,
        },
      ]
    : [],
)

export function hasRequiredPermissions(user: CurrentUser | null, requiredPermissions?: string[]) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  if (!user) {
    return false
  }

  return requiredPermissions.every((permission) => user.permissions.includes(permission))
}

export function getVisibleNavigation(user: CurrentUser | null) {
  return navigationItems.filter((item) => hasRequiredPermissions(user, item.requiredPermissions))
}

export function getFirstAccessiblePath(user: CurrentUser | null) {
  return getVisibleNavigation(user)[0]?.to ?? '/forbidden'
}

export function getCurrentRouteMeta(pathname: string) {
  const normalizedPath = normalizePathname(pathname)
  return appRouteMeta.find((route) => route.matches(normalizedPath)) ?? null
}

export function canAccessPath(user: CurrentUser | null, pathname: string) {
  const route = getCurrentRouteMeta(pathname)

  if (!route) {
    return false
  }

  return hasRequiredPermissions(user, route.requiredPermissions)
}

export { defaultCatalogKey }
