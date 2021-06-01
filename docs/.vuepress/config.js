const path = require('path')

module.exports = {
  plugins: {
    'demo-code': {
      showText: 'show code',
      hideText: 'hide',
      minHeight: 0,
      onlineBtns: {
        codepen: false,
        jsfiddle: false,
        codesandbox: false,
      }
    }
  },

  transpileDependencies: [
    'vuetify'
  ],

  locales: {
    '/': {
      lang: 'en-US',
      title: 'Cylc UI'
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
          { text: 'Components', link: '/components/' },
        ],
        sidebar: {
          '/components/': [
            {
              title: 'Components',
              collapsable: false,
              children: [
                'alert',
                'job',
                'task'
              ]
            }
          ]
        }
      }
    }
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../src/')
      }
    }
  },

  chainWebpack (config) {
    // overwrite loader options
    for (const lang of ["sass", "scss"]) {
      for (const name of ["modules", "normal"]) {
        const rule = config.module.rule(lang).oneOf(name);
        rule.uses.delete("sass-loader");
        const end = lang === 'sass' ? "'" : "';"

        rule
          .use("sass-loader")
          .loader("sass-loader")
          .options({
            implementation: require("sass"),
            sassOptions: {
              indentedSyntax: lang === "sass"
            },
            // here I needed to add a global variables files which also imports ~vuetify/src/styles/styles.sass inside,
            // for overwriting Vuetify framework variables
            // additionalData: `
            //     @import '~@/styles/index.scss${end}
            // `
          });
      }
    }
  }

}
