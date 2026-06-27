<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('now', '+1 month');

        return [
            'title' => fake()->sentence(3),
            'description' => fake()->optional(0.7)->paragraph(),
            'start_at' => $start,
            'end_at' => fake()->boolean(60)
                ? (clone $start)->modify('+'.fake()->numberBetween(30, 180).' minutes')
                : null,
            'all_day' => false,
            'color' => fake()->randomElement(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', null]),
            'location' => fake()->optional(0.5)->city(),
            'user_id' => User::factory(),
        ];
    }

    public function allDay(): static
    {
        return $this->state(fn () => [
            'all_day' => true,
            'end_at' => null,
        ]);
    }
}
