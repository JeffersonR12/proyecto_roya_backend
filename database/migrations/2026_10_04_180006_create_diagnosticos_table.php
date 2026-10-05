<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnosticos', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid_local')->unique();
            $table->foreignId('tenant_id')->constrained('tenants')->restrictOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('parcela_id')->nullable()->constrained('parcelas')->nullOnDelete();
            $table->foreignId('catalogo_id')->nullable()->constrained('catalogo_fitosanitario')->nullOnDelete();
            $table->string('clase', 30);
            $table->decimal('confianza', 5, 2);
            $table->decimal('severidad', 5, 2)->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->string('imagen_path', 255);
            $table->string('mascara_path', 255)->nullable();
            $table->string('modelo_version', 50);
            $table->timestamp('captured_at');
            $table->timestamp('synced_at')->nullable();
            $table->string('sync_status', 20)->default('confirmed');
            $table->timestamps();

            $table->index(['tenant_id', 'sync_status']);
            $table->index(['tenant_id', 'captured_at']);
            $table->index('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnosticos');
    }
};
