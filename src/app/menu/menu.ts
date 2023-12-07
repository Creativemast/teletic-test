import { CoreMenu } from '@core/types'

export const menu: CoreMenu[] = [
  {
    id: 'home',
    title: 'Home',
    translate: 'MENU.HOME',
    type: 'item',
    icon: 'home',
    url: 'home'
  },
  {
    id: 'apps',
    type: 'section',
    title: 'Features',
    translate: 'MENU.APPS.SECTION',
    icon: 'package',
    children: [
      {
        id: 'users',
        title: 'Users',
        translate: 'MENU.APPS.USER.LIST',
        type: 'item',
        icon: 'user',
        url: 'features/user/user-list',
        role: ['Admin']
      },
      {
        id: 'jobApplications',
        title: 'Job Applications',
        translate: 'MENU.APPS.JOB_APPLICATIONS.LIST',
        type: 'item',
        icon: 'git-pull-request',
        url: 'features/job-applications/list'
      }
    ]
  }
]
