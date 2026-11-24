<?php

declare(strict_types=1);

namespace HiEvents\Http\Request\Order;

use HiEvents\Http\Request\BaseRequest;
use HiEvents\Validators\CompleteOrderValidator;
use Illuminate\Auth\AuthenticationException;

class CompleteOrderRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->boolean('use_attendee_profile')) {
            return;
        }

        $user = auth('api')->user();
        if (! $user || ! $this->bearerToken()) {
            throw new AuthenticationException;
        }

        $profile = [
            'first_name' => trim((string) $user->first_name),
            'last_name' => trim((string) $user->last_name),
            'email' => $user->email,
            'email_confirmation' => $user->email,
        ];
        $order = $this->input('order');
        $products = $this->input('products');

        $this->merge([
            'order' => [...(is_array($order) ? $order : []), ...$profile, 'opted_into_marketing' => false],
            'products' => is_array($products) ? array_map(
                static fn ($product) => is_array($product) ? [...$product, ...$profile] : $product,
                $products,
            ) : $products,
        ]);
    }

    public function rules(): array
    {
        if ($this->route() === null) {
            return [
                'use_attendee_profile' => ['sometimes', 'boolean'],
                'order.first_name' => ['required', 'string', 'max:40'],
                'order.last_name' => ['required', 'string', 'max:40'],
                'order.email' => ['required', 'email'],
                'order.email_confirmation' => ['required', 'email', 'same:order.email'],
                'order.questions' => ['array'],
                'order.address' => ['array'],
                'order.address.address_line_1' => ['nullable', 'string', 'max:255'],
                'order.address.address_line_2' => ['nullable', 'string', 'max:255'],
                'order.address.city' => ['nullable', 'string', 'max:85'],
                'order.address.state_or_region' => ['nullable', 'string', 'max:85'],
                'order.address.zip_or_postal_code' => ['nullable', 'string', 'max:85'],
                'order.address.country' => ['nullable', 'string', 'max:2'],
                'products' => ['array'],
            ];
        }

        return ['use_attendee_profile' => ['sometimes', 'boolean'], ...app(CompleteOrderValidator::class)->rules()];
    }

    public function messages(): array
    {
        return app(CompleteOrderValidator::class)->messages();
    }
}
