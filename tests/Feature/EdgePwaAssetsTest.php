<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * La PWA diagnostica sin red solo si el repo trae el modelo, sus metadatos,
 * el manifest instalable y un service worker con cache versionada (T-13, T-15).
 */
class EdgePwaAssetsTest extends TestCase
{
    public function test_pwa_manifest_and_worker_are_public(): void
    {
        $this->assertFileExists(public_path('manifest.webmanifest'));
        $this->assertFileExists(public_path('sw.js'));
        $this->assertFileExists(public_path('icons/roya.svg'));
        $this->assertFileExists(public_path('imagenes/riwiscan-logo.png'));
        $this->assertFileExists(public_path('imagenes/logo f.png'));
    }

    public function test_model_and_its_metadata_are_in_the_repo(): void
    {
        $modelo = public_path('models/modelo_roya.onnx');
        $metaPath = public_path('models/modelo_roya.json');

        $this->assertFileExists($modelo, 'Falta el modelo: un despliegue desde git no podria diagnosticar.');
        $this->assertFileExists($metaPath, 'Falta modelo_roya.json. Ejecuta: npm run modelo:meta');
        $this->assertLessThan(50 * 1024 * 1024, filesize($modelo), 'Mas de 50 MB: usar Git LFS en lugar de versionarlo directo.');

        $meta = json_decode((string) file_get_contents($metaPath), true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame(hash_file('sha256', $modelo), $meta['sha256'], 'El sha256 no coincide: ejecuta npm run modelo:meta.');
        $this->assertSame(filesize($modelo), $meta['bytes']);
        $this->assertSame($this->clientConstant('MODELO_VERSION'), $meta['version'], 'La version del JSON no es MODELO_VERSION de inference.js.');
        $this->assertSame(['sana', 'roya_amarilla', 'otra_enfermedad'], $meta['clases']);
        $this->assertSame([1, 3, 224, 224], $meta['entrada']);
    }

    public function test_model_is_not_ignored_by_git(): void
    {
        $gitignore = (string) file_get_contents(base_path('.gitignore'));

        $this->assertStringNotContainsString('/public/models/*.onnx', $gitignore);
    }

    public function test_manifest_is_installable(): void
    {
        $manifest = json_decode((string) file_get_contents(public_path('manifest.webmanifest')), true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame('RiwiScan', $manifest['short_name']);
        $this->assertNotEmpty($manifest['name']);
        $this->assertSame('/', $manifest['start_url']);
        $this->assertSame('standalone', $manifest['display']);
        $this->assertNotEmpty($manifest['theme_color']);

        $sizes = [];

        foreach ($manifest['icons'] as $icon) {
            $path = public_path(ltrim($icon['src'], '/'));
            $this->assertFileExists($path);
            $this->assertSame('image/png', $icon['type']);

            [$width, $height] = getimagesize($path);
            $this->assertSame($icon['sizes'], "{$width}x{$height}", "El tamaño real de {$icon['src']} no coincide con el manifest.");
            $sizes[] = $icon['sizes'];
        }

        $this->assertContains('192x192', $sizes);
        $this->assertContains('512x512', $sizes);
    }

    public function test_service_worker_cache_is_versioned(): void
    {
        $sw = (string) file_get_contents(public_path('sw.js'));

        $this->assertStringNotContainsString("'roya-edge-v1'", $sw, 'Un nombre de cache fijo deja a los telefonos con el modelo viejo.');
        $this->assertStringContainsString('roya-app-${BUILD_ID}', $sw);
        $this->assertStringContainsString('roya-runtime-${MODELO_VERSION}', $sw);
        $this->assertStringContainsString('/models/modelo_roya.json', $sw);
        $this->assertStringContainsString('/build/manifest.json', $sw);
        $this->assertStringContainsString('SKIP_WAITING', $sw);
    }

    public function test_edge_inference_rules_live_in_the_client(): void
    {
        $source = (string) file_get_contents(resource_path('js/lib/inference.js'));

        $this->assertStringContainsString('UMBRAL_CONFIANZA = 75', $source);
        $this->assertStringContainsString('roya_amarilla', $source);
        $this->assertStringContainsString('no_concluyente', $source);
    }

    private function clientConstant(string $name): string
    {
        $source = (string) file_get_contents(resource_path('js/lib/inference.js'));
        $this->assertMatchesRegularExpression("/export const {$name} = '([^']+)'/", $source);
        preg_match("/export const {$name} = '([^']+)'/", $source, $match);

        return $match[1];
    }
}
