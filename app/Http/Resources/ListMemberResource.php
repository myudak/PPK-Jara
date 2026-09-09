<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListMemberResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'task_list_id' => $this->task_list_id,
            'user_id' => $this->user_id,
            'joined_at' => $this->joined_at?->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
