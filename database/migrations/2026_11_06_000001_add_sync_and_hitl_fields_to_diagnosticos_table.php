<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Campos que el Edge ya maneja (HITL, etiqueta humana, scores) y que la
 * sincronizacion necesita persistir en la nube.
 *
 * - imagen_path pasa a nullable: un diagnostico Edge puede llegar sin evidencia.
 * - softDeletes: baja logica (rules.md §5, no borrar evidencia auditada).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnosticos', function (Blueprint $table) {
            $table->string('hitl_status', 20)->default('pending')->after('sync_status');
            $table->string('etiqueta_humana', 30)->nullable()->after('hitl_status');
            $table->json('scores')->nullable()->after('severidad');
            $table->string('imagen_path', 255)->nullable()->change();
            $table->softDeletes();

            $table->index(['tenant_id', 'hitl_status']);
        });
    }

    public function down(): void
    {
        Schema::table('diagnosticos', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'hitl_status']);
            $table->dropSoftDeletes();
            $table->dropColumn(['hitl_status', 'etiqueta_humana', 'scores']);
        });
    }
};
