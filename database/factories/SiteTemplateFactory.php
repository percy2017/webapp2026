<?php

namespace Database\Factories;

use App\Models\SiteTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteTemplate>
 */
class SiteTemplateFactory extends Factory
{
    protected $model = SiteTemplate::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => fake()->unique()->slug(2),
            'description' => fake()->sentence(),
            'thumbnail_media_id' => null,
            'icon' => fake()->randomElement([
                'Sparkles', 'LayoutGrid', 'BarChart3', 'ListOrdered',
                'UtensilsCrossed', 'Clock', 'Quote', 'Dumbbell',
                'CreditCard', 'Users', 'Megaphone', 'MapPin',
            ]),
            'is_active' => false,
            'sections' => [],
            'theme' => [
                'primary_color' => '#3b82f6',
                'accent_color' => '#10b981',
                'radius' => '0.75rem',
            ],
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['is_active' => true]);
    }
}
