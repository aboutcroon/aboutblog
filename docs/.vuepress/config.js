module.exports = {
    title: 'Croon Liu',
    description: 'Replace the stars and rivers in the body with unlimited methods for the future',
    head: [['link', { rel: 'icon', href: '/hero.JPG' }]],
    themeConfig: {
        nav: [
            {
                text: 'Docs',
                items: [
                    { text: 'JavaScript', link: '/JavaScript/' },
                    { text: 'CSS', link: '/CSS/' },
                    { text: 'HTTP', link: '/HTTP/' },
                    { text: 'Git', link: '/Git/' },
                    { text: 'Vue3', link: '/Vue3/' },
                    { text: 'SSR', link: '/SSR/' },
                    { text: '开发提效', link: '/开发提效/' },
                    { text: '高级程序设计', link: '/高级程序设计/' },
                ],
            },
            // { text: 'Project', link: '/Project/' },
            // { text: 'Resume', link: '/Resume/' },
            { text: 'GitHub', link: 'https://github.com/aboutcroon' },
        ],
        sidebar: {
            '/JavaScript/': ['', 'ES6'],
            '/CSS/': [''],
            '/HTTP/': [''],
            '/Git/': [''],
            '/Vue3/': ['', 'guide', 'migration', 'api', 'router'],
            '/SSR/': [''],
            '/开发提效/': [''],
            '/高级程序设计/': ['', '第8章', '第10章', '第14章']
        },
    },
    base: '/',
}
