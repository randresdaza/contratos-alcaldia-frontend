export default {
    name: 'auth',
    component: () => import('src/modules/auth/layouts/Auth.vue'),
    children: [
        {
            path: '',
            name: 'login',
            component: () => import('src/modules/auth/pages/Login.vue'),
        },
        // {
        //     path: '/register',
        //     name: 'register',
        //     component: () => import('src/modules/auth/views/Register.vue'),
        // },
    ]
}