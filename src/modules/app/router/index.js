export default {
  path: '/',
  redirect: { name: 'home' },
  component: () => import('src/modules/app/layouts/MainLayout.vue'),
  children: [
    {
      path: 'home',
      name: 'home',
      component: () => import('src/modules/app/pages/IndexPage.vue'),
    },
    {
      path: 'users',
      name: 'users',
      component: () => import('src/modules/app/pages/Users.vue'),
      meta: { roles: ['Administrador'] }
    },
    {
      path: 'roles',
      name: 'roles',
      component: () => import('src/modules/app/pages/Role.vue'),
      meta: { roles: ['Administrador'] }
    },
    {
      path: 'contracts',
      name: 'contracts',
      component: () => import('src/modules/app/pages/Contracts.vue'),
    },
    {
      path: 'contracts/new-contract',
      name: 'new-contract',
      component: () => import('src/modules/app/pages/NewContract.vue'),
    },
    {
      path: 'contracts/update-contract/:id',
      name: 'edit-contract',
      component: () => import('src/modules/app/pages/NewContract.vue'),
      props: (route) => {
        return {
          id: route.params.id
        }
      }
    },
    {
      path: 'contracts/view-docs-contract/:id',
      name: 'docs',
      component: () => import('src/modules/app/pages/Documents.vue'),
      props: (route) => {
        return {
          id: route.params.id
        }
      }
    },
    {
      path: 'contracts/view-docs-contract/:id/view-doc/:idDoc/:file',
      name: 'view-doc',
      component: () => import('src/modules/app/pages/ViewDocument.vue'),
      props: (route) => {
        return {
          idDoc: route.params.idDoc,
          file: route.params.file
        }
      }
    },
    {
      path: 'dependencies',
      name: 'dependencies',
      component: () => import('src/modules/app/pages/Dependencies.vue'),
    },
    {
      path: 'series',
      name: 'series',
      component: () => import('src/modules/app/pages/Series.vue'),
    },
    {
      path: 'subseries',
      name: 'subseries',
      component: () => import('src/modules/app/pages/Subseries.vue'),
    },
    {
      path: 'audit',
      name: 'audit',
      component: () => import('src/modules/app/pages/Audit.vue'),
      meta: { roles: ['Administrador', 'Supervisor'] }
    },
    {
      path: 'reports',
      name: 'reports',
      component: () => import('src/modules/app/pages/Reports.vue'),
      meta: { roles: ['Administrador', 'Supervisor'] }
    },
    {
      path: 'sftp',
      name: 'sftp',
      component: () => import('src/modules/app/pages/SFTP.vue'),
      meta: { roles: ['Administrador'] }
    },
  ]
}
