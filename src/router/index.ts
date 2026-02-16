import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import DiscoverView from '../views/DiscoverView.vue'
import MyPackagesView from '../views/MyPackagesView.vue'
import DownloadsView from '../views/DownloadsView.vue'
import SettingsView from '../views/SettingsView.vue'
import PackageDetailView from '../views/PackageDetailView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '',
                    name: 'discover',
                    component: DiscoverView
                },
                {
                    path: 'package/:id',
                    name: 'package-detail',
                    component: PackageDetailView,
                    props: true
                },
                {
                    path: 'library',
                    name: 'library',
                    component: MyPackagesView
                },
                {
                    path: 'downloads',
                    name: 'downloads',
                    component: DownloadsView
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: SettingsView
                }
            ]
        }
    ]
})

export default router
