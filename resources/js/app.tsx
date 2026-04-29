import { createInertiaApp } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Layout from './layouts/Layout';

const appName = 'Sữa cừu Việt Nam';

type Page = {
    default: React.ComponentType & {
        layout?: (page: ReactNode) => ReactNode | null;
    };
};

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob<Page>('./pages/**/*.tsx', {
            eager: true,
        });
        const page = pages[`./pages/${name}.tsx`];

        if (page.default.layout === undefined) {
            page.default.layout = (page) => <Layout>{page}</Layout>;
        }

        return page;
    },
    title: (title) => (title ? `${title} - ${appName}` : appName),
    strictMode: true,

    progress: {
        color: '#4B5563',
    },
});
