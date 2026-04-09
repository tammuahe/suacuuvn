import { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface Props {
    quantity: number;
    onChangeQuantity: (qty: number) => void;
    onRemove: () => void;
    /** 'card' = compact for product cards, 'drawer' = slightly smaller for cart rows */
    size?: 'card' | 'drawer';
}

export default function QuantityStepper({
    quantity,
    onChangeQuantity,
    onRemove,
    size = 'card',
}: Props) {
    // Local draft so the input feels instant; only commits on blur/Enter
    const [draft, setDraft] = useState(String(quantity));
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep draft in sync when external quantity changes (e.g. another component)
    useEffect(() => {
        setDraft(String(quantity));
    }, [quantity]);

    const commit = (raw: string) => {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed > 0) {
            onChangeQuantity(parsed);
            setDraft(String(parsed));
        } else {
            // Restore to last valid value
            setDraft(String(quantity));
        }
    };

    const btnBase =
        size === 'card'
            ? 'flex h-8 w-8 items-center justify-center rounded-xl transition-colors'
            : 'flex h-7 w-7 items-center justify-center rounded-full transition-colors';

    const inputWidth = size === 'card' ? 'w-10' : 'w-8';

    return (
        <div className="flex items-center gap-2">
            {/* − / + stepper */}
            <div
                className={`flex items-center rounded-2xl ${
                    size === 'card'
                        ? 'bg-md-primary-container px-1 py-1'
                        : 'bg-md-surface-container-high px-0.5 py-0.5'
                }`}
            >
                <button
                    onClick={() => onChangeQuantity(quantity - 1)}
                    className={`${btnBase} ${
                        size === 'card'
                            ? 'text-md-on-primary-container hover:bg-md-primary/10'
                            : 'text-md-on-surface-variant hover:bg-md-surface-container-highest'
                    }`}
                    aria-label="Giảm số lượng"
                >
                    <Minus className={size === 'card' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
                </button>

                {/* Editable input */}
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
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
                    className={`${inputWidth} bg-transparent text-center text-sm font-bold outline-none select-all ${
                        size === 'card' ? 'text-md-on-primary-container' : 'text-md-on-surface'
                    }`}
                />

                <button
                    onClick={() => onChangeQuantity(quantity + 1)}
                    className={`${btnBase} ${
                        size === 'card'
                            ? 'text-md-on-primary-container hover:bg-md-primary/10'
                            : 'text-md-on-surface-variant hover:bg-md-surface-container-highest'
                    }`}
                    aria-label="Tăng số lượng"
                >
                    <Plus className={size === 'card' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
                </button>
            </div>

            {/* Remove */}
            <button
                onClick={onRemove}
                className="flex h-7 w-7 items-center justify-center rounded-full text-md-on-surface-variant hover:text-md-error hover:bg-md-error-container transition-colors"
                aria-label="Xoá sản phẩm"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}
