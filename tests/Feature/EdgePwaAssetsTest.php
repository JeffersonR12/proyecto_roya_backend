<?php

namespace Tests\Feature;

use Tests\TestCase;

class EdgePwaAssetsTest extends TestCase
{
    public function test_pwa_manifest_and_worker_are_public(): void
    {
        $this->assertFileExists(public_path('manifest.webmanifest'));
        $this->assertFileExists(public_path('sw.js'));
        $this->assertFileExists(public_path('icons/roya.svg'));
        $this->assertStringContainsString('roya-edge', (string) file_get_contents(public_path('sw.js')));
        $this->assertStringContainsString('standalone', (string) file_get_contents(public_path('manifest.webmanifest')));
    }

    public function test_edge_inference_rules_live_in_the_client(): void
    {
        $source = (string) file_get_contents(resource_path('js/lib/inference.js'));

        $this->assertStringContainsString('UMBRAL_CONFIANZA = 75', $source);
        $this->assertStringContainsString('roya_amarilla', $source);
        $this->assertStringContainsString('no_concluyente', $source);
    }
}
