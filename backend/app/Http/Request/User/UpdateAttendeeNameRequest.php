<?php

declare(strict_types=1);

namespace HiEvents\Http\Request\User;

use HiEvents\Http\Request\BaseRequest;

class UpdateAttendeeNameRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:40'],
            'last_name' => ['required', 'string', 'max:40'],
        ];
    }
}
