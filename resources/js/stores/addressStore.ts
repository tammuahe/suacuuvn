import { create } from 'zustand';

interface Ward {
    name: string;
    code: number;
    district_code: number;
}

interface District {
    name: string;
    code: number;
    province_code: number;
    wards: Ward[];
}

interface Province {
    name: string;
    code: number;
    districts: District[];
}

interface AddressStore {
    provinces: Province[];
    loading: boolean;
    fetched: boolean;
    fetchProvinces: () => Promise<void>;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
    provinces: [],
    loading: false,
    fetched: false,
    fetchProvinces: async () => {
        if (get().fetched || get().loading) {
            return;
        }

        set({ loading: true });

        try {
            const res = await fetch('/addresses.json');
            const data: Province[] = await res.json();
            set({ provinces: data, fetched: true });
        } finally {
            set({ loading: false });
        }
    },
}));

if (typeof window !== 'undefined') {
    useAddressStore.getState().fetchProvinces();
}

export type { Province, District, Ward };
