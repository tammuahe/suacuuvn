<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string', 'max:65535'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'image_url' => ['nullable', 'string', 'url', 'max:2048'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'is_active' => ['boolean'],
        ];
    }
}
