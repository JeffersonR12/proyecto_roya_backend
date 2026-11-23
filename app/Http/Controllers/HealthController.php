<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Estado del servicio para el monitor externo (UptimeRobot u otro).
 * 200 si todo responde, 503 si algo falla. Solo dice "ok"/"fail" por pieza:
 * nunca devuelve mensajes de error, rutas ni credenciales.
 *
 * /up (de Laravel) solo dice que PHP arranca; /health comprueba las dependencias.
 */
class HealthController extends Controller
{
    /** Ventana en la que un trabajo fallido de la cola marca el servicio como caido. */
    public const FAILED_JOBS_WINDOW_HOURS = 24;

    public const MODEL_PATH = 'models/modelo_roya.onnx';

    public function __invoke(): JsonResponse
    {
        $checks = [
            'database' => $this->check(fn () => DB::select('select 1')),
            'storage' => $this->check(fn () => $this->writeAndDelete(Storage::build([
                'driver' => 'local',
                'root' => storage_path('framework'),
                'throw' => true,
            ]))),
            'fotos' => $this->check(fn () => $this->writeAndDelete(
                Storage::disk(config('filesystems.diagnosticos_disk'))
            )),
            'cola' => $this->check(fn () => $this->recentFailedJobs() === 0),
            'modelo' => $this->check(fn () => is_file(public_path(self::MODEL_PATH))),
        ];

        $healthy = ! in_array('fail', $checks, true);

        return response()->json([
            'status' => $healthy ? 'ok' : 'fail',
            'checks' => $checks,
        ], $healthy ? 200 : 503, ['Cache-Control' => 'no-store']);
    }

    /**
     * @param  callable(): mixed  $probe  falla si lanza una excepcion o devuelve false
     */
    private function check(callable $probe): string
    {
        try {
            return $probe() === false ? 'fail' : 'ok';
        } catch (Throwable $e) {
            report($e);

            return 'fail';
        }
    }

    private function writeAndDelete(Filesystem $disk): bool
    {
        $path = '.health/'.gethostname().'.txt';

        return $disk->put($path, now()->toIso8601String()) && $disk->delete($path);
    }

    private function recentFailedJobs(): int
    {
        $table = config('queue.failed.table', 'failed_jobs');

        if (! Schema::hasTable($table)) {
            return 0;
        }

        return DB::table($table)
            ->where('failed_at', '>=', now()->subHours(self::FAILED_JOBS_WINDOW_HOURS))
            ->count();
    }
}
