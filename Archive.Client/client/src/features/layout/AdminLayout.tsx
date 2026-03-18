import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/providers/auth-context'
import { getCurrentRouteMeta, getVisibleNavigation } from '../../core/router/route-config'
import { catalogEntries, defaultCatalogKey } from '../nomenclatures/catalogConfig'
import { Button } from '../../shared/ui/Button'
import { cn } from '../../shared/utils/cn'
import { localizeRoleName } from '../../shared/utils/localization'
import { ThemeToggle } from './ThemeToggle'

export function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navigation = getVisibleNavigation(user)
  const canViewNomenclatures = navigation.some((item) => item.to === '/nomenclatures')
  const [isNomenclaturesOpen, setIsNomenclaturesOpen] = useState(location.pathname.startsWith('/nomenclatures'))

  useEffect(() => {
    if (location.pathname.startsWith('/nomenclatures')) {
      setIsNomenclaturesOpen(true)
    }
  }, [location.pathname])

  const currentSection = getCurrentRouteMeta(location.pathname)
  const title = currentSection?.title ?? 'Detalii student'
  const currentIcon = currentSection?.icon ?? 'material-symbols:contact-page-rounded'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white/80 px-5 py-6 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 lg:flex">
          <div className="min-h-0 space-y-6 overflow-y-auto pr-1">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
                Arhiva UTM
              </p>
              <h1 className="text-[1.75rem] font-semibold tracking-tight">Platformă administrativă</h1>
            </div>

            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.to)
                const isNomenclatures = item.to === '/nomenclatures'

                return (
                  <div className="space-y-1.5" key={item.to}>
                    {isNomenclatures ? (
                      <button
                        aria-expanded={isNomenclaturesOpen}
                        className={cn(
                          'flex w-full items-center justify-between rounded-[1rem] border px-3.5 py-2.5 text-sm font-medium transition',
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)] dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                            : 'border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-50',
                        )}
                        onClick={() => {
                          if (!isActive) {
                            setIsNomenclaturesOpen(true)
                            navigate(`/nomenclatures/${defaultCatalogKey}`)
                            return
                          }

                          setIsNomenclaturesOpen((current) => !current)
                        }}
                        type="button"
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition',
                              isActive
                                ? 'border-white/15 bg-white/10 text-white dark:border-slate-300/60 dark:bg-slate-950/70 dark:text-slate-100'
                                : 'border-slate-200/80 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200',
                            )}
                          >
                            <Icon icon={item.icon} width={18} />
                          </span>
                          <span>{item.label}</span>
                        </span>
                        <Icon icon={isNomenclaturesOpen ? 'material-symbols:keyboard-arrow-up-rounded' : 'material-symbols:keyboard-arrow-down-rounded'} width={20} />
                      </button>
                    ) : (
                      <NavLink
                        className={cn(
                          'block flex-1 rounded-[1rem] border px-3.5 py-2.5 text-sm font-medium transition',
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)] dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                            : 'border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-50',
                        )}
                        to={item.to}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition',
                              isActive
                                ? 'border-white/15 bg-white/10 text-white dark:border-slate-300/60 dark:bg-slate-950/70 dark:text-slate-100'
                                : 'border-slate-200/80 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200',
                            )}
                          >
                            <Icon icon={item.icon} width={18} />
                          </span>
                          <span>{item.label}</span>
                        </span>
                      </NavLink>
                    )}

                    {isNomenclatures && isNomenclaturesOpen ? (
                      <div className="space-y-1 pl-4">
                        {catalogEntries.map(([catalogKey, catalog]) => {
                          const childPath = `/nomenclatures/${catalogKey}`
                          const isChildActive = location.pathname === childPath

                          return (
                            <NavLink
                              className={cn(
                                'flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-sm transition',
                                isChildActive
                                  ? 'bg-slate-200/70 text-slate-950 dark:bg-slate-900 dark:text-slate-50'
                                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900/80 dark:hover:text-slate-50',
                              )}
                              key={catalogKey}
                              to={childPath}
                            >
                              <Icon icon={catalog.icon} width={16} />
                              <span>{catalog.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </nav>
          </div>

          <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/70">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Autentificat ca
            </p>
            <p className="mt-2.5 text-sm font-semibold">{user?.fullName}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{user?.roles.map(localizeRoleName).join(', ')}</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
            <div className="flex flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-10 lg:py-6 xl:px-12">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-slate-200/80 bg-white text-slate-600 shadow-sm sm:h-12 sm:w-12 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
                      <Icon icon={currentIcon} width={22} />
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
                  </div>
                </div>

                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                  <Button
                    className="min-w-0 justify-center text-center sm:flex-none"
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                    variant="secondary"
                  >
                    Deconectare
                  </Button>
                  <ThemeToggle />
                </div>
              </div>

              <div className="space-y-3 lg:hidden">
                <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {navigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.to)

                    return (
                      <NavLink
                        className={cn(
                          'rounded-xl border px-3 py-2 text-sm font-medium transition',
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                            : 'border-slate-200/80 text-slate-600 hover:bg-slate-50 dark:border-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-900',
                        )}
                        key={item.to}
                        to={item.to}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Icon icon={item.icon} width={18} />
                          <span className="truncate">{item.label}</span>
                        </span>
                      </NavLink>
                    )
                  })}
                </nav>

                {canViewNomenclatures && location.pathname.startsWith('/nomenclatures') ? (
                  <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {catalogEntries.map(([catalogKey, catalog]) => {
                      const childPath = `/nomenclatures/${catalogKey}`
                      const isChildActive = location.pathname === childPath

                      return (
                        <NavLink
                          className={cn(
                            'rounded-xl border px-3 py-2 text-sm font-medium transition',
                            isChildActive
                              ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                              : 'border-slate-200/80 text-slate-600 hover:bg-slate-50 dark:border-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-900',
                          )}
                          key={catalogKey}
                          to={childPath}
                        >
                          <span className="flex items-center gap-2">
                            <Icon icon={catalog.icon} width={16} />
                            <span className="truncate">{catalog.label}</span>
                          </span>
                        </NavLink>
                      )
                    })}
                  </nav>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:px-10 lg:py-8 xl:px-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
