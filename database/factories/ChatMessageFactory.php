<?php

namespace Database\Factories;

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'chat_id' => Chat::factory(),
            'sender_id' => User::factory(),
            'sender_type' => 'agent',
            'content' => fake()->sentence(),
            'read_at' => null,
        ];
    }

    public function visitor(): static
    {
        return $this->state(fn () => [
            'sender_type' => 'visitor',
        ]);
    }
}
