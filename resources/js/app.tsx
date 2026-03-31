import { createInertiaApp } from '@inertiajs/react';
import { ReactNode } from 'react';
import Layout from './layouts/Layout';

const appName = 'Sữa cừu Việt Nam';

type Page = {
  default: React.ComponentType & {
    layout?: (page: ReactNode) => ReactNode
  }
}

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob<Page>('./pages/**/*.tsx', { eager: true });
        let page = pages[`./pages/${name}.tsx`];

        page.default.layout =
            page.default.layout || ((page) => <Layout children={page} />);
        return page;
    },
    title: (title) => (title ? `${title} - ${appName}` : appName),
    strictMode: true,

    progress: {
        color: '#4B5563',
    },
});
