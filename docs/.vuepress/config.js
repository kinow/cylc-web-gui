module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Cylc UI Components'
    }
  },

  themeConfig: {
    repoLabel: 'Contribute!',
    // git repo here... gitlab, github
    repo: 'https://github.com/cylc/cylc-ui/',
    docsDir: 'docs',
    editLinks: true,
    docsBranch: 'dev',
    editLinkText: 'Help us improve this page!',
    search: true,
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        lastUpdated: 'Last Updated',
        // service worker is configured but will only register in production
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh'
          }
        },
        nav: [
          { text: 'Getting Started', link: '/guide' },
          { text: 'Components', link: '/components/' },
          // external link to git repo...again
          { text: 'GitHub', link: 'https://github.com/cylc/cylc-ui/' }
        ],
        sidebar: {
          '/components/': [
            {
              title: 'Components',
              collapsable: false,
              children: ['job-component']
            }
          ]
        }
      }
    }
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@': '../../src'
      }
    }
  }
}
