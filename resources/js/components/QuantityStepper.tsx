import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Props {
    quantity: number;
    onChangeQuantity: (qty: number) => void;
    onRemove: () => void;
    size?: 'card' | 'drawer' | 'detail';
}

const sizeStyles = {
    card: {
        wrap: 'bg-md-primary-container px-1 py-1',
        btn: 'flex h-8 w-8 items-center justify-center rounded-xl transition-colors text-md-on-primary-container hover:bg-md-primary/10',
        icon: 'h-4 w-4',
        input: 'w-10 bg-transparent text-center text-sm font-bold outline-none select-all text-md-on-primary-container',
    },
    drawer: {
        wrap: 'bg-md-surface-container-high px-0.5 py-0.5',
        btn: 'flex h-7 w-7 items-center justify-center rounded-full transition-colors text-md-on-surface-variant hover:bg-md-surface-container-highest',
        icon: 'h-3.5 w-3.5',
        input: 'w-8 bg-transparent text-center text-sm font-bold outline-none select-all text-md-on-surface',
    },
    detail: {
        wrap: 'bg-md-primary-container px-2 py-2',
        btn: 'flex h-10 w-10 items-center justify-center rounded-xl transition-colors text-md-on-primary-container hover:bg-md-primary/10',
        icon: 'h-5 w-5',
        input: 'w-14 bg-transparent text-center text-base font-bold outline-none select-all text-md-on-primary-container',
    },
};

export default function QuantityStepper({
    quantity,
    onChangeQuantity,
    onRemove,
    size = 'card',
}: Props) {
    const [draft, setDraft] = useState(String(quantity));
    const inputRef = useRef<HTMLInputElement>(null);
    const s = sizeStyles[size];

    useEffect(() => {
        setDraft(String(quantity));
    }, [quantity]);

    const commit = (raw: string) => {
        const parsed = parseInt(raw, 10);

        if (!isNaN(parsed) && parsed > 0) {
            onChangeQuantity(parsed);
            setDraft(String(parsed));
        } else {
            setDraft(String(quantity));
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`flex items-center rounded-2xl ${s.wrap}`}>
                <button
                    onClick={() => onChangeQuantity(quantity - 1)}
                    className={s.btn}
                    aria-label="Giảm số lượng"
                >
                    <Minus className={s.icon} />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={draft}
                    onChange={(e) =>
                        setDraft(e.target.value.replace(/\D/g, ''))
                    }
                    onBlur={(e) => commit(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            inputRef.current?.blur();
                        }

                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            onChangeQuantity(quantity + 1);
                        }

                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            onChangeQuantity(Math.max(1, quantity - 1));
                        }
                    }}
                    className={s.input}
                />

                <button
                    onClick={() => onChangeQuantity(quantity + 1)}
                    className={s.btn}
                    aria-label="Tăng số lượng"
                >
                    <Plus className={s.icon} />
                </button>
            </div>

            <button
                onClick={onRemove}
                className="flex h-7 w-7 items-center justify-center rounded-full text-md-on-surface-variant transition-colors hover:bg-md-error-container hover:text-md-error"
                aria-label="Xoá sản phẩm"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}
