<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnosticos', function (Blueprint $table) {
            $table->string('hitl_status', 20)->default('pending')->after('sync_status');
            $table->string('etiqueta_humana', 30)->nullable()->after('hitl_status');
            $table->string('ubicacion', 255)->nullable()->after('longitud');
            $table->text('last_error')->nullable()->after('etiqueta_humana');

            $table->index(['tenant_id', 'hitl_status']);
        });
    }

    public function down(): void
    {
        Schema::table('diagnosticos', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'hitl_status']);
            $table->dropColumn(['hitl_status', 'etiqueta_humana', 'ubicacion', 'last_error']);
        });
    }
};
