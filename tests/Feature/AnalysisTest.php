<?php

namespace Tests\Feature;

use App\Models\Analysis;
use App\Models\User;
use App\Support\SimulatedInspection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AnalysisTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_saves_a_file_and_a_simulated_result(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/analysis', [
            'image_base64' => $this->jpegDataUrl(),
            'location' => 'Lote 4',
            'disease_detected' => 'Otra enfermedad',
            'confidence' => 0.99,
        ]);

        $response->assertCreated()
            ->assertJsonPath('analysis.disease_detected', SimulatedInspection::DISEASE)
            ->assertJsonPath('analysis.location', 'Lote 4')
            ->assertJsonPath('analysis.user_id', $user->id);

        $analysis = Analysis::query()->first();
        $severity = (int) round($analysis->confidence * 100);

        $this->assertContains($severity, SimulatedInspection::SAMPLES);
        $this->assertNull($analysis->image_base64);
        $this->assertNotNull($analysis->image_path);
        Storage::disk('public')->assertExists($analysis->image_path);
        $response->assertJsonPath('estimate.severity', $severity);
    }

    public function test_store_rejects_a_file_that_is_not_an_image(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/analysis', [
            'image_base64' => 'data:image/jpeg;base64,'.base64_encode('esto no es una imagen'),
        ])->assertStatus(422)->assertJsonValidationErrors('image_base64');

        $this->assertSame(0, Analysis::query()->count());
    }

    public function test_technician_only_receives_their_inspections(): void
    {
        $technician = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->inspection($technician, 'Lote propio', 0.36);
        $this->inspection($admin, 'Lote ajeno', 0.08);

        $this->actingAs($technician)->getJson('/analysis')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.location', 'Lote propio')
            ->assertJsonPath('stats.total', 1);

        $this->actingAs($admin)->getJson('/analysis')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('stats.total', 2);
    }

    public function test_history_filter_does_not_change_dashboard_totals(): void
    {
        $user = User::factory()->create();
        $this->inspection($user, 'Critico', 0.67);
        $this->inspection($user, 'Sano', 0.05);

        $this->actingAs($user)->getJson('/analysis?risk=healthy')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.location', 'Sano')
            ->assertJsonPath('stats.total', 2)
            ->assertJsonPath('stats.healthy', 1)
            ->assertJsonPath('stats.critical', 1);
    }

    public function test_export_escapes_commas_and_respects_visibility(): void
    {
        $technician = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $this->inspection($technician, 'Lote Norte, vereda 2', 0.22);
        $this->inspection($admin, 'Otro lote', 0.49);

        $content = $this->actingAs($technician)->get('/analysis/export')->assertOk()->streamedContent();

        $this->assertStringContainsString('"Lote Norte, vereda 2"', $content);
        $this->assertStringNotContainsString('Otro lote', $content);
    }

    private function inspection(User $user, string $location, float $confidence): Analysis
    {
        return Analysis::query()->create([
            'user_id' => $user->id,
            'disease_detected' => SimulatedInspection::DISEASE,
            'confidence' => $confidence,
            'location' => $location,
        ]);
    }

    private function jpegDataUrl(): string
    {
        $image = imagecreatetruecolor(8, 8);
        ob_start();
        imagejpeg($image);
        $binary = ob_get_clean();
        imagedestroy($image);

        return 'data:image/jpeg;base64,'.base64_encode($binary);
    }
}
