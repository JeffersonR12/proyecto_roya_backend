<?php

namespace Tests\Feature;

use App\Models\Analysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalysisControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/')->assertRedirect('/login');
        $this->postJson('/analysis', $this->validPayload())->assertUnauthorized();
        $this->assertDatabaseCount('analyses', 0);
    }

    public function test_user_can_store_an_analysis(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/analysis', $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('analysis.user.id', $user->id)
            ->assertJsonPath('analysis.disease_detected', 'roya_amarilla');
        $this->assertDatabaseHas('analyses', [
            'user_id' => $user->id,
            'location' => 'Lote Norte',
        ]);
    }

    public function test_location_is_optional(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/analysis', $this->validPayload(['location' => null]))
            ->assertCreated();
    }

    public function test_store_rejects_missing_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/analysis', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['disease_detected', 'confidence', 'image_base64']);
    }

    public function test_store_rejects_confidence_outside_zero_to_one(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/analysis', $this->validPayload(['confidence' => 1.5]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('confidence');

        $this->actingAs($user)
            ->postJson('/analysis', $this->validPayload(['confidence' => 'alta']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('confidence');
    }

    public function test_store_ignores_user_id_from_the_request(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/analysis', $this->validPayload(['user_id' => $other->id]))
            ->assertCreated();

        $this->assertDatabaseHas('analyses', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('analyses', ['user_id' => $other->id]);
    }

    public function test_user_only_sees_own_analyses(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->createAnalysis($user, 'Lote Propio');
        $this->createAnalysis($other, 'Lote Ajeno');

        $response = $this->actingAs($user)->get('/');

        $response->assertOk()->assertViewHas('page', 'app');
        $locations = $response->viewData('analyses')->pluck('location')->all();
        $this->assertSame(['Lote Propio'], $locations);
    }

    public function test_administrator_sees_all_analyses(): void
    {
        $admin = User::factory()->create(['role' => 'administrador']);
        $this->createAnalysis($admin, 'Lote Admin');
        $this->createAnalysis(User::factory()->create(), 'Lote Agricultor');

        $response = $this->actingAs($admin)->get('/');

        $response->assertOk();
        $this->assertCount(2, $response->viewData('analyses'));
    }

    private function createAnalysis(User $user, string $location): Analysis
    {
        return Analysis::create($this->validPayload([
            'user_id' => $user->id,
            'location' => $location,
        ]));
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'disease_detected' => 'roya_amarilla',
            'confidence' => 0.82,
            'image_base64' => 'data:image/jpeg;base64,AAAA',
            'location' => 'Lote Norte',
        ], $overrides);
    }
}
